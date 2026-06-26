import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/audio_service.dart';
import 'course_detail_screen.dart';
import 'donate_screen.dart';
import 'sermons_screen.dart';
import 'login_screen.dart';
import 'blog_screen.dart';
import 'book_reader_screen.dart';
import '../services/theme_service.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedTab = 0;
  String? _lastWatchedCourseId;
  int _lastWatchedLessonIndex = 0;
  
  String _studentDepartment = 'Not Assigned';
  List<String> _contributionLogs = [];
  double _totalContributions = 0.0;

  final List<GlobalKey<NavigatorState>> _navigatorKeys = [
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
  ];

  Future<void> _loadProfileData() async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'] ?? 'guest';
      final prefs = await SharedPreferences.getInstance();
      
      final dept = prefs.getString('profile_dept_$userId') ?? 'Not Assigned';
      final logs = prefs.getStringList('profile_contributions_$userId') ?? [];
      
      double total = 0.0;
      for (final log in logs) {
        final parts = log.split('|');
        if (parts.length >= 2) {
          total += double.tryParse(parts[1]) ?? 0.0;
        }
      }
      
      if (mounted) {
        setState(() {
          _studentDepartment = dept;
          _contributionLogs = logs;
          _totalContributions = total;
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _saveDepartment(String dept) async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'] ?? 'guest';
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('profile_dept_$userId', dept);
      if (mounted) {
        setState(() {
          _studentDepartment = dept;
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _addContribution(String type, double amount) async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'] ?? 'guest';
      final prefs = await SharedPreferences.getInstance();
      
      final now = DateTime.now();
      final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final newLog = '$type|$amount|$dateStr';
      
      final currentLogs = prefs.getStringList('profile_contributions_$userId') ?? [];
      currentLogs.insert(0, newLog);
      await prefs.setStringList('profile_contributions_$userId', currentLogs);
      
      await _loadProfileData();
    } catch (e) {
      // Ignore
    }
  }

  void _resetNavigatorsToRoot() {
    for (final key in _navigatorKeys) {
      key.currentState?.popUntil((route) => route.isFirst);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final apiService = Provider.of<ApiService>(context, listen: false);
      apiService.fetchCourses();
      apiService.fetchBooks();
      apiService.fetchMessages();
      _loadLastWatchedCourse();
      _loadProfileData();
    });
  }

  Future<void> _loadLastWatchedCourse() async {
    _loadProfileData();
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'];
      if (userId != null) {
        final prefs = await SharedPreferences.getInstance();
        final id = prefs.getString('last_watched_course_id_$userId');
        int lessonIdx = 0;
        if (id != null) {
          lessonIdx = prefs.getInt('last_watched_lesson_index_${id}_$userId') ?? 0;
        }
        if (mounted) {
          setState(() {
            _lastWatchedCourseId = id;
            _lastWatchedLessonIndex = lessonIdx;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _lastWatchedCourseId = null;
            _lastWatchedLessonIndex = 0;
          });
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _navigateToTabProtected(int index) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    if (apiService.currentUser == null) {
      final currentNavigator = _navigatorKeys[_selectedTab].currentState;
      if (currentNavigator != null) {
        final loggedIn = await currentNavigator.push<bool>(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
        if (loggedIn == true && mounted) {
          _resetNavigatorsToRoot();
          setState(() {
            _selectedTab = index;
          });
          _loadLastWatchedCourse();
        }
      }
    } else {
      setState(() {
        _selectedTab = index;
      });
      _loadLastWatchedCourse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final apiService = Provider.of<ApiService>(context);
    final user = apiService.currentUser;

    final List<Widget> tabs = [
      TabNavigator(
        navigatorKey: _navigatorKeys[0],
        rootPage: Consumer<ApiService>(
          builder: (context, api, _) => _buildDashboardTab(api, api.currentUser),
        ),
      ),
      TabNavigator(
        navigatorKey: _navigatorKeys[1],
        rootPage: Consumer<ApiService>(
          builder: (context, api, _) => CoursesTab(
            api: api,
            user: api.currentUser,
            lastWatchedCourseId: _lastWatchedCourseId,
            lastWatchedLessonIndex: _lastWatchedLessonIndex,
            onReloadLastWatched: _loadLastWatchedCourse,
          ),
        ),
      ),
      TabNavigator(
        navigatorKey: _navigatorKeys[2],
        rootPage: Consumer<ApiService>(
          builder: (context, api, _) => _buildBooksTab(api, api.currentUser),
        ),
      ),
      TabNavigator(
        navigatorKey: _navigatorKeys[3],
        rootPage: const SermonsScreen(),
      ),
      TabNavigator(
        navigatorKey: _navigatorKeys[4],
        rootPage: Consumer<ApiService>(
          builder: (context, api, _) => _buildProfileTab(api, api.currentUser),
        ),
      ),
    ];

    return Consumer<AudioService>(
      builder: (context, audio, _) {
        final isLight = Theme.of(context).brightness == Brightness.light;
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, _) async {
            if (didPop) return;
            final currentNavigator = _navigatorKeys[_selectedTab].currentState;
            if (currentNavigator != null && currentNavigator.canPop()) {
              currentNavigator.pop();
              return;
            }
            final shouldExit = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                title: Text(
                  'Exit SOP Academy?',
                  style: TextStyle(
                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                content: Text(
                  'Are you sure you want to exit the app?',
                  style: TextStyle(
                    color: isLight ? Colors.black54 : Colors.white70,
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(false),
                    child: Text(
                      'Stay',
                      style: TextStyle(
                        color: isLight ? Colors.black38 : Colors.white54,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(ctx).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFBBF24),
                      foregroundColor: const Color(0xFF0F172A),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Exit', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
            if (shouldExit == true && context.mounted) {
              SystemNavigator.pop();
            }
          },
          child: Scaffold(
            backgroundColor: isLight ? Theme.of(context).scaffoldBackgroundColor : Colors.transparent,
            body: Container(
              decoration: BoxDecoration(
                gradient: isLight
                    ? null
                    : const LinearGradient(
                        colors: [
                          Color(0xFF05070F), // Rich deep dark navy
                          Color(0xFF090D1C), // Midnight navy
                          Color(0xFF120E2E), // Subtle dark indigo/violet glow at the bottom
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
              ),
              child: SafeArea(
                child: IndexedStack(
                  index: _selectedTab,
                  children: tabs,
                ),
              ),
            ),
            bottomNavigationBar: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ── Persistent Global Mini-Player ────────────────────────────
                if (audio.currentSermon != null) _buildMiniPlayer(audio),
                // ── Bottom Navigation Bar ────────────────────────────────────
                Container(
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: isLight ? Colors.black.withOpacity(0.06) : Colors.white.withOpacity(0.08),
                        width: 1,
                      ),
                    ),
                  ),
                  child: BottomNavigationBar(
                    currentIndex: _selectedTab,
                    onTap: (index) {
                      if (_selectedTab == index) {
                        _navigatorKeys[index].currentState?.popUntil((route) => route.isFirst);
                      } else if (index == 1) {
                        _navigateToTabProtected(index);
                      } else {
                        setState(() {
                          _selectedTab = index;
                        });
                        _loadLastWatchedCourse();
                      }
                    },
                    type: BottomNavigationBarType.fixed,
                    backgroundColor: isLight ? Colors.white : const Color(0xFF090D1C),
                    selectedItemColor: isLight ? const Color(0xFF4F46E5) : const Color(0xFFFBBF24),
                    unselectedItemColor: isLight ? Colors.black45 : Colors.white60,
                    items: const [
                      BottomNavigationBarItem(
                        icon: Icon(Icons.dashboard_outlined),
                        activeIcon: Icon(Icons.dashboard),
                        label: 'Portal',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.school_outlined),
                        activeIcon: Icon(Icons.school),
                        label: 'Courses',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.menu_book_outlined),
                        activeIcon: Icon(Icons.menu_book),
                        label: 'Books',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.headset_mic_outlined),
                        activeIcon: Icon(Icons.headset_mic),
                        label: 'Sermons',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.person_outline),
                        activeIcon: Icon(Icons.person),
                        label: 'Profile',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ), // Scaffold
        ); // PopScope
      },
    );
  }


  Widget _buildMiniPlayer(AudioService audio) {
    final sermon = audio.currentSermon!;
    final maxSecs = audio.duration.inSeconds > 0
        ? audio.duration.inSeconds.toDouble()
        : 1.0;
    final curSecs = audio.position.inSeconds
        .toDouble()
        .clamp(0.0, maxSecs);
    final isLight = Theme.of(context).brightness == Brightness.light;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isLight
              ? [Colors.white, const Color(0xFFF8FAFC)]
              : [const Color(0xFF111E3E), const Color(0xFF1E3A8A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border(
          top: BorderSide(
            color: isLight ? Colors.black.withOpacity(0.05) : const Color(0xFFFBBF24).withOpacity(0.3),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: isLight ? Colors.black.withOpacity(0.06) : Colors.black.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(12, 10, 8, 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              // Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  sermon['thumbnail'] ?? '',
                  width: 44,
                  height: 44,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isLight ? const Color(0xFFEEF2F6) : const Color(0xFF4F46E5),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.music_note, color: isLight ? const Color(0xFF4F46E5) : Colors.white, size: 24),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Title + speaker
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sermon['title'] ?? '',
                      style: TextStyle(
                        color: isLight ? const Color(0xFF1E293B) : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      sermon['speaker'] ?? '',
                      style: TextStyle(
                        color: isLight ? Colors.black54 : Colors.white54,
                        fontSize: 11,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Skip backward 10s
              IconButton(
                icon: Icon(Icons.replay_10, color: isLight ? Colors.black87 : Colors.white70, size: 22),
                onPressed: audio.skipBackward,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              // Play / Pause
              IconButton(
                icon: Icon(
                  audio.isPlaying
                      ? Icons.pause_circle_filled
                      : Icons.play_circle_fill,
                  color: const Color(0xFFFBBF24),
                  size: 38,
                ),
                onPressed: () {
                  if (audio.isPlaying) {
                    audio.pause();
                  } else {
                    audio.resume();
                  }
                },
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              // Skip forward 10s
              IconButton(
                icon: Icon(Icons.forward_10, color: isLight ? Colors.black87 : Colors.white70, size: 22),
                onPressed: audio.skipForward,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              // Close
              IconButton(
                icon: Icon(Icons.close, color: isLight ? Colors.black38 : Colors.white38, size: 20),
                onPressed: audio.stop,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          // Progress bar
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: const Color(0xFFFBBF24),
              inactiveTrackColor: isLight ? Colors.black.withOpacity(0.08) : Colors.white12,
              thumbColor: const Color(0xFFFBBF24),
              overlayColor: const Color(0xFFFBBF24).withOpacity(0.2),
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5.0),
              trackHeight: 2.0,
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
            ),
            child: Row(
              children: [
                Text(
                  audio.formatDuration(audio.position),
                  style: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 9.5),
                ),
                Expanded(
                  child: Slider(
                    min: 0.0,
                    max: maxSecs,
                    value: curSecs,
                    onChanged: (v) => audio.seek(Duration(seconds: v.toInt())),
                  ),
                ),
                Text(
                  audio.formatDuration(audio.duration),
                  style: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 9.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Container(
      decoration: BoxDecoration(
        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withOpacity(isLight ? 0.15 : 0.4), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(isLight ? 0.04 : 0.25),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icon with gradient background
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: gradientColors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: color.withOpacity(isLight ? 0.2 : 0.45),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 12),
                // Title & subtitle
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isLight ? const Color(0xFF1E293B) : Colors.white,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isLight ? color.withOpacity(0.85) : color.withOpacity(0.7),
                        fontSize: 9.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showLiveServicesDialog(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Grab handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.live_tv_rounded, color: Color(0xFFFBBF24), size: 28),
                  const SizedBox(width: 10),
                  Text(
                    'Live Broadcasts',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: isLight ? const Color(0xFF1E293B) : Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Join our active services and virtual intercessory prayer sessions.',
                style: TextStyle(
                  color: isLight ? Colors.black54 : Colors.white60,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 20),

              // Item 1: Live Glory Service
              _buildBroadcastItem(
                title: 'Sunday Glory Service',
                type: 'Live Stream',
                time: 'Sunday • 9:00 AM (EST)',
                host: 'Prophet Elijah Mensah',
                isLive: true,
                isLight: isLight,
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening Sunday Glory Service Live Stream...')),
                  );
                },
              ),
              const SizedBox(height: 12),

              // Item 2: Midweek Intercession
              _buildBroadcastItem(
                title: 'Midweek Intercession Circle',
                type: 'Zoom Meeting',
                time: 'Wednesday • 6:00 PM (EST)',
                host: 'Prophetess Grace Adeyemi',
                isLive: false,
                isLight: isLight,
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening Midweek Intercession Zoom Link...')),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBroadcastItem({
    required String title,
    required String type,
    required String time,
    required String host,
    required bool isLive,
    required bool isLight,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isLive
              ? const Color(0xFFFBBF24).withOpacity(0.3)
              : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.1)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (isLive) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'LIVE NOW',
                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      type,
                      style: TextStyle(
                        color: isLive ? const Color(0xFFFBBF24) : (isLight ? Colors.indigo[900] : Colors.indigo[100]),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Host: $host • $time',
                  style: TextStyle(
                    color: isLight ? Colors.black54 : Colors.white54,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: isLive ? const Color(0xFFFBBF24) : (isLight ? const Color(0xFFEEF2F6) : Colors.white10),
              foregroundColor: isLive ? const Color(0xFF0F172A) : (isLight ? const Color(0xFF1E293B) : Colors.white70),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(
              isLive ? 'Join' : 'Link',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardTab(ApiService api, Map<String, dynamic>? user) {
    final enrolledIds = user?['enrolledCourses'] ?? [];
    final enrolledCourses = api.courses.where((c) => enrolledIds.contains(c['id'])).toList();
    final isLight = Theme.of(context).brightness == Brightness.light;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Welcome and Name/Guest
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Shalom,',
                    style: TextStyle(fontSize: 16, color: isLight ? Colors.indigo[900] : Colors.indigo[100]),
                  ),
                  Text(
                    user?['name'] ?? 'Guest',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => setState(() => _selectedTab = 4),
                child: Container(
                  width: 45,
                  height: 45,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFFFBBF24)],
                    ),
                  ),
                  child: Center(
                    child: Text(
                      user != null && user['name'].isNotEmpty ? user['name'][0].toUpperCase() : 'G',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Theme toggle button
              GestureDetector(
                onTap: () => Provider.of<ThemeService>(context, listen: false).toggle(),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 52,
                  height: 28,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: isLight ? const Color(0xFF111E3E) : const Color(0xFFFBBF24),
                  ),
                  padding: const EdgeInsets.all(3),
                  child: Stack(
                    children: [
                      AnimatedAlign(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        alignment: isLight ? Alignment.centerLeft : Alignment.centerRight,
                        child: Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isLight ? Colors.white : const Color(0xFF111E3E),
                          ),
                          child: Icon(
                            isLight ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                            size: 14,
                            color: isLight ? const Color(0xFF111E3E) : const Color(0xFFFBBF24),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Sign In Call-To-Action for Guest
          if (user == null) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFBBF24).withOpacity(isLight ? 0.12 : 0.08),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFFBBF24).withOpacity(isLight ? 0.3 : 0.15)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Color(0xFFFBBF24), size: 30),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Unlocking Prophetic Schools',
                          style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 15),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Sign in to access your course catalog, assignments, and mentorship circles.',
                          style: TextStyle(color: isLight ? Colors.black54 : Colors.indigo[100], fontSize: 11, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () => _navigateToTabProtected(1),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFBBF24),
                      foregroundColor: const Color(0xFF0F172A),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    child: const Text('Login', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Daily Activation Devotional Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.purple.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.auto_awesome, color: Color(0xFFFBBF24), size: 20),
                    SizedBox(width: 8),
                    Text(
                      'DAILY PROPHETIC ACTIVATION',
                      style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1),
                    )
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Discerning Atmospheric Shifts',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                ),
                const SizedBox(height: 8),
                Text(
                  'Today\'s exercise: Spend 10 minutes in absolute silence. Write down the first three spiritual sensations that register in your environment.',
                  style: TextStyle(color: Colors.indigo[50], fontSize: 14, height: 1.4),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Activation log opened! Submit your response.')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF4F46E5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Log Response', style: TextStyle(fontWeight: FontWeight.bold)),
                )
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Prophetic Portal Grid
          Text(
            'Prophetic Portal',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
          ),
           const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.35,
            children: [
              _buildGridCard(
                icon: Icons.menu_book_rounded,
                title: 'Books',
                subtitle: 'Explore & purchase literature',
                color: const Color(0xFFF59E0B),
                gradientColors: const [Color(0xFFF59E0B), Color(0xFFD97706)],
                onTap: () {
                  setState(() {
                    _selectedTab = 2;
                  });
                },
              ),
              _buildGridCard(
                icon: Icons.surround_sound_rounded,
                title: 'Anointed Sermons',
                subtitle: 'Play audio messages',
                color: const Color(0xFF10B981),
                gradientColors: const [Color(0xFF10B981), Color(0xFF059669)],
                onTap: () {
                  setState(() {
                    _selectedTab = 3;
                  });
                },
              ),
              _buildGridCard(
                icon: Icons.article_rounded,
                title: 'Prophetic Blog',
                subtitle: 'Read revelations & study',
                color: const Color(0xFF8B5CF6),
                gradientColors: const [Color(0xFF8B5CF6), Color(0xFFD946EF)],
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const BlogScreen()),
                  );
                },
              ),
              _buildGridCard(
                icon: Icons.volunteer_activism_rounded,
                title: 'Support Ministry',
                subtitle: 'Prophet offering & outreach',
                color: const Color(0xFFEC4899),
                gradientColors: const [Color(0xFFEC4899), Color(0xFFDB2777)],
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const DonateScreen()),
                  );
                },
              ),
              _buildGridCard(
                icon: Icons.school_rounded,
                title: 'Academy courses',
                subtitle: 'Curriculum & lectures',
                color: const Color(0xFF6366F1),
                gradientColors: const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                onTap: () => _navigateToTabProtected(1),
              ),
              _buildGridCard(
                icon: Icons.manage_accounts_rounded,
                title: 'Student Profile',
                subtitle: 'Account settings',
                color: const Color(0xFF6B7280),
                gradientColors: const [Color(0xFF6B7280), Color(0xFF4B5563)],
                onTap: () {
                  setState(() {
                    _selectedTab = 4;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Enrolled Courses section (Only visible when user is logged in)
          if (user != null) ...[
            Text(
              'My Courses',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
            ),
            const SizedBox(height: 16),
            if (enrolledCourses.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isLight ? Colors.black.withOpacity(0.02) : const Color(0xFF1E293B).withOpacity(0.35),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isLight ? Colors.black.withOpacity(0.06) : Colors.white.withOpacity(0.12)),
                ),
                child: Column(
                  children: [
                    Icon(Icons.import_contacts, size: 40, color: isLight ? Colors.black26 : Colors.white24),
                    const SizedBox(height: 12),
                    Text(
                      'No enrolled courses yet.',
                      style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 15),
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: enrolledCourses.length,
                itemBuilder: (context, idx) {
                  final course = enrolledCourses[idx];
                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => CourseDetailScreen(course: course)),
                      );
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.12)),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              course['thumbnail'],
                              width: 100,
                              height: 65,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  course['category'],
                                  style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  course['title'],
                                  style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 15),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${course['lessons']} lessons • ${course['duration']}',
                                  style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 12),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              )
          ],
        ],
      ),
    );
  }

  // CoursesTab was refactored into a standalone StatefulWidget at the bottom of this file.

  Widget _buildBooksTab(ApiService api, Map<String, dynamic>? user) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final books = api.books;

    return RefreshIndicator(
      onRefresh: () async {
        await api.fetchBooks();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'E-Books Library',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: isLight ? const Color(0xFF1E293B) : Colors.white,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Equip your spiritual library with literature resources',
              style: TextStyle(
                color: isLight ? Colors.indigo[900]?.withOpacity(0.7) : Colors.indigo[100],
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 24),
            if (books.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40.0),
                  child: Column(
                    children: [
                      Icon(Icons.library_books_outlined, size: 60, color: isLight ? Colors.black26 : Colors.white24),
                      const SizedBox(height: 16),
                      Text(
                        'No books available right now.',
                        style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.52,
                ),
                itemCount: books.length,
                itemBuilder: (context, idx) {
                  final book = books[idx];
                  final price = book['price'] ?? 0.0;
                  final isFree = price == 0.0;
                  return GestureDetector(
                    onTap: () => _showBookDetailsBottomSheet(book),
                    child: Container(
                      decoration: BoxDecoration(
                        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF111E3E),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.1)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(isLight ? 0.03 : 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Cover image with category badge
                          Expanded(
                            child: Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                  child: Image.network(
                                    book['coverUrl'] ?? '',
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      color: isLight ? Colors.black12 : Colors.white12,
                                      child: const Center(child: Icon(Icons.book, size: 40)),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF6366F1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      book['category'] ?? 'General',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Information area
                          Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  book['title'] ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'By ${book['author'] ?? ''}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: isLight ? Colors.black54 : Colors.white54,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Icon(Icons.pages_outlined, size: 12, color: isLight ? Colors.black38 : Colors.white38),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${book['pages'] ?? 0} pages',
                                      style: TextStyle(
                                        color: isLight ? Colors.black54 : Colors.white54,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                // Price & Action Row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      isFree ? 'FREE' : '₦${price.toStringAsFixed(0)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: isFree ? const Color(0xFF10B981) : (isLight ? const Color(0xFF1E293B) : Colors.white),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFBBF24),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(
                                        Icons.shopping_cart_rounded,
                                        size: 16,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            content: Text('Could not open purchase link: $urlString'),
          ),
        );
      }
    }
  }

  void _showBookDetailsBottomSheet(Map<String, dynamic> book) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final price = book['price'] ?? 0.0;
    final isFree = price == 0.0;
    final rating = book['rating'] ?? 5.0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isLight ? Colors.white : const Color(0xFF0F172A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 20,
                spreadRadius: 5,
              )
            ],
          ),
          padding: const EdgeInsets.only(left: 24, right: 24, top: 16, bottom: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pull bar
              Center(
                child: Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Header section with cover image
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.network(
                      book['coverUrl'] ?? '',
                      width: 90,
                      height: 130,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 90,
                        height: 130,
                        color: isLight ? Colors.black12 : Colors.white12,
                        child: const Center(child: Icon(Icons.book, size: 30)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            book['category'] ?? 'General',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          book['title'] ?? '',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isLight ? const Color(0xFF1E293B) : Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'By ${book['author'] ?? ''}',
                          style: TextStyle(
                            color: isLight ? Colors.black54 : Colors.white54,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              rating.toString(),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: isLight ? Colors.black87 : Colors.white70,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Icon(Icons.pages_outlined, size: 14, color: isLight ? Colors.black38 : Colors.white38),
                            const SizedBox(width: 4),
                            Text(
                              '${book['pages'] ?? 0} pages',
                              style: TextStyle(
                                color: isLight ? Colors.black54 : Colors.white54,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                'About the Book',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 150),
                child: SingleChildScrollView(
                  child: Text(
                    book['description'] ?? 'No description available for this book.',
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: isLight ? Colors.black87 : Colors.white70,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Buttons Stack
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => BookReaderScreen(book: book),
                          ),
                        );
                      },
                      icon: const Icon(Icons.menu_book_rounded, color: Colors.white),
                      label: const Text('Read E-Book', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  if (book['selarUrl'] != null && book['selarUrl'].toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).pop();
                          _launchUrl(book['selarUrl']);
                        },
                        icon: const Icon(Icons.shopping_cart_rounded, color: Colors.white),
                        label: const Text('Buy on Selar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF97316),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  if (book['amazonUrl'] != null && book['amazonUrl'].toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).pop();
                          _launchUrl(book['amazonUrl']);
                        },
                        icon: const Icon(Icons.store_rounded, color: Colors.white),
                        label: const Text('Buy on Amazon', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEAB308),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showDepartmentSelector() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final departments = [
      {'name': 'Prophetic School', 'icon': Icons.auto_awesome, 'desc': 'Discerning spiritual dimensions and atmospheres'},
      {'name': 'Warfare & Intercession', 'icon': Icons.shield_outlined, 'desc': 'Strategic kingdom prayer and deliverance'},
      {'name': 'Worship & Arts', 'icon': Icons.music_note, 'desc': 'Anointed praise, adoration, and creative arts'},
      {'name': 'Bible Study & Theology', 'icon': Icons.menu_book, 'desc': 'Sound doctrine and hermeneutics training'},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isLight ? Colors.white : const Color(0xFF0F172A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Select Academy Department',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Align your profile with your specific spiritual training department track.',
                style: TextStyle(color: isLight ? Colors.black54 : Colors.white60, fontSize: 12),
              ),
              const SizedBox(height: 16),
              ...departments.map((dept) {
                final isSelected = _studentDepartment == dept['name'];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF6366F1).withOpacity(0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF6366F1)
                          : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: ListTile(
                    leading: Icon(
                      dept['icon'] as IconData,
                      color: isSelected ? const Color(0xFF6366F1) : (isLight ? Colors.black45 : Colors.white54),
                    ),
                    title: Text(
                      dept['name'] as String,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isSelected
                            ? const Color(0xFF6366F1)
                            : (isLight ? const Color(0xFF1E293B) : Colors.white),
                      ),
                    ),
                    subtitle: Text(
                      dept['desc'] as String,
                      style: TextStyle(fontSize: 11, color: isLight ? Colors.black54 : Colors.white38),
                    ),
                    trailing: isSelected
                        ? const Icon(Icons.check_circle_rounded, color: Color(0xFF6366F1))
                        : null,
                    onTap: () {
                      _saveDepartment(dept['name'] as String);
                      Navigator.of(context).pop();
                    },
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _showContributionsSheet() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: isLight ? Colors.white : const Color(0xFF0F172A),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                ),
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.75,
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: isLight ? Colors.black12 : Colors.white24,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Outreach Seed Log',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: isLight ? const Color(0xFF1E293B) : Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Track tithes and supporting seeds',
                              style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBBF24).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '\$${_totalContributions.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Color(0xFFFBBF24),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        _showLogSeedDialog();
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Log Supporting Seed', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFBBF24),
                        foregroundColor: const Color(0xFF0F172A),
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'CONTRIBUTION RECORDS',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: _contributionLogs.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.volunteer_activism_outlined, size: 48, color: isLight ? Colors.black26 : Colors.white24),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No supporting seeds logged yet.',
                                    style: TextStyle(color: isLight ? Colors.black45 : Colors.white30, fontSize: 13),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Log your first Tithe or Offering above!',
                                    style: TextStyle(color: isLight ? Colors.black38 : Colors.white24, fontSize: 11),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              itemCount: _contributionLogs.length,
                              itemBuilder: (context, idx) {
                                final log = _contributionLogs[idx];
                                final parts = log.split('|');
                                if (parts.length < 3) return const SizedBox();
                                final type = parts[0];
                                final amount = double.tryParse(parts[1]) ?? 0.0;
                                final date = parts[2];
                                
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: (type == 'Tithe' ? const Color(0xFF10B981) : const Color(0xFF6366F1)).withOpacity(0.15),
                                              shape: BoxShape.circle,
                                            ),
                                            child: Icon(
                                              type == 'Tithe' ? Icons.account_balance_wallet_rounded : Icons.star_rounded,
                                              color: type == 'Tithe' ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                                              size: 18,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                type,
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                                  fontSize: 14,
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                date,
                                                style: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 11),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        '\$${amount.toStringAsFixed(2)}',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showLogSeedDialog() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final amountController = TextEditingController();
    String selectedType = 'Tithe';
    final types = ['Tithe', 'Prophet Offering', 'Outreach Seed', 'Kingdom Partnership'];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: isLight ? Colors.white : const Color(0xFF0F172A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text(
                'Log Support Seed',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Seed Category:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedType,
                        dropdownColor: isLight ? Colors.white : const Color(0xFF1E293B),
                        style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontWeight: FontWeight.bold),
                        isExpanded: true,
                        items: types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setDialogState(() => selectedType = val);
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Amount (\$):', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                    decoration: InputDecoration(
                      hintText: 'e.g. 50.00',
                      hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                      filled: true,
                      fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Cancel', style: TextStyle(color: isLight ? Colors.black54 : Colors.white70)),
                ),
                ElevatedButton(
                  onPressed: () {
                    final amt = double.tryParse(amountController.text);
                    if (amt != null && amt > 0) {
                      _addContribution(selectedType, amt);
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Logged support seed of \$$amt successfully!')),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a valid amount.')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFBBF24),
                    foregroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Log Seed', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showAccountDetailsSheet(Map<String, dynamic> user) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isLight ? Colors.white : const Color(0xFF0F172A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Student Credentials',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              _buildCredentialRow('Full Name', user['name'] ?? 'N/A', isLight),
              _buildCredentialRow('Email Address', user['email'] ?? 'N/A', isLight),
              _buildCredentialRow('Account Status', 'Active Disciple', isLight, badge: true),
              _buildCredentialRow('Student ID', 'FOI-${(user['id'] ?? 'user').toString().substring(0, 5).toUpperCase()}', isLight),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCredentialRow(String label, String value, bool isLight, {bool badge = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 14)),
          badge
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    border: Border.all(color: const Color(0xFF10B981)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Active',
                    style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                )
              : Text(
                  value,
                  style: TextStyle(
                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
        ],
      ),
    );
  }

  void _showSupportSheet() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isLight ? Colors.white : const Color(0xFF0F172A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Academy Support Center',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Have questions about your curriculum or billing? Get in touch with us directly.',
                style: TextStyle(color: isLight ? Colors.black54 : Colors.white60, fontSize: 13),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.email_outlined, color: Color(0xFF6366F1)),
                title: const Text('Email Support', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('support@foiacademy.org'),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF10B981)),
                title: const Text('WhatsApp Intercessory/Support', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('+234 800 FOI ACADEMY'),
                onTap: () {},
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  void _showAboutSheet() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isLight ? Colors.white : const Color(0xFF0F172A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isLight ? Colors.black12 : Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'About FOI Academy',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'FOI Academy is a premiere spiritual training platform dedicated to raising leaders, intercessors, and prophets across the globe.',
                style: TextStyle(color: isLight ? Colors.black87 : Colors.white70, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                'Version: 1.0.4 (Production Build)',
                style: TextStyle(color: isLight ? Colors.black38 : Colors.white30, fontSize: 11),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required bool isLight,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.12)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: isLight ? const Color(0xFF1E293B) : Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: TextStyle(
              fontSize: 11,
              color: isLight ? Colors.black54 : Colors.white54,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileTab(ApiService api, Map<String, dynamic>? user) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Avatar
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFFFBBF24)]),
              boxShadow: [
                BoxShadow(
                  color: isLight ? Colors.indigo.withOpacity(0.1) : Colors.purple.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ]
            ),
            child: Center(
              child: Text(
                user != null && user['name'].toString().isNotEmpty ? user['name'][0].toUpperCase() : 'G',
                style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            user?['name'] ?? 'Guest Student',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
          ),
          const SizedBox(height: 6),
          Text(
            user?['email'] ?? 'Sign in to access your student portal',
            style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 14),
          ),
          
          if (user != null && _studentDepartment != 'Not Assigned') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _studentDepartment == 'Prophetic School'
                        ? Icons.auto_awesome
                        : _studentDepartment == 'Warfare & Intercession'
                            ? Icons.shield_outlined
                            : _studentDepartment == 'Worship & Arts'
                                ? Icons.music_note
                                : Icons.menu_book,
                    color: const Color(0xFF6366F1),
                    size: 14,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _studentDepartment,
                    style: const TextStyle(
                      color: Color(0xFF6366F1),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          // Stats Row
          if (user != null) ...[
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Enrolled',
                    value: '${(user['enrolledCourses'] as List?)?.length ?? 0}',
                    icon: Icons.school_rounded,
                    color: const Color(0xFF6366F1),
                    isLight: isLight,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Books',
                    value: '${api.books.length}',
                    icon: Icons.menu_book_rounded,
                    color: const Color(0xFFFBBF24),
                    isLight: isLight,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Status',
                    value: 'Active',
                    icon: Icons.verified_user_rounded,
                    color: const Color(0xFF10B981),
                    isLight: isLight,
                  ),
                ),
              ],
            ),
          ],
          
          const SizedBox(height: 32),

          // Options List
          _buildProfileOption(
            icon: Icons.lock,
            title: 'Account Settings',
            subtitle: 'View credentials and student status',
            onTap: () {
              if (user != null) {
                _showAccountDetailsSheet(user);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please sign in to view account settings.')),
                );
              }
            },
          ),
          if (user != null) ...[
            _buildProfileOption(
              icon: Icons.school_outlined,
              title: 'Academy Department',
              subtitle: _studentDepartment == 'Not Assigned'
                  ? 'Tap to select your academy track'
                  : 'Assigned: $_studentDepartment',
              onTap: () => _showDepartmentSelector(),
            ),
            _buildProfileOption(
              icon: Icons.volunteer_activism_outlined,
              title: 'Tithe & Supporting Seeds',
              subtitle: _totalContributions > 0
                  ? 'Total logged seeds: \$${_totalContributions.toStringAsFixed(2)}'
                  : 'Log Tithes and Offering supporting seeds',
              onTap: () => _showContributionsSheet(),
            ),
          ],
          _buildProfileOption(
            icon: Icons.help_outline,
            title: 'Support Center',
            subtitle: 'Contact support & check resources',
            onTap: () => _showSupportSheet(),
          ),
          _buildProfileOption(
            icon: Icons.info_outline_rounded,
            title: 'About FOI Academy',
            subtitle: 'Application versions & parameters',
            onTap: () => _showAboutSheet(),
          ),
          const SizedBox(height: 24),
          
          user != null 
            ? ElevatedButton.icon(
                onPressed: () async {
                  await api.logout();
                  _resetNavigatorsToRoot();
                  if (mounted) {
                    setState(() {
                      _selectedTab = 0;
                    });
                  }
                },
                icon: const Icon(Icons.logout),
                label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[900],
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              )
            : ElevatedButton.icon(
                onPressed: () async {
                  final loggedIn = await Navigator.push<bool>(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                  if (loggedIn == true && mounted) {
                    setState(() {});
                  }
                },
                icon: const Icon(Icons.login),
                label: const Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFBBF24),
                  foregroundColor: const Color(0xFF0F172A),
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
        ],
      ),
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E293B).withOpacity(0.35),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.12)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: ListTile(
            leading: Icon(icon, color: const Color(0xFFFBBF24)),
            title: Text(title, style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text(subtitle, style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 11)),
            trailing: Icon(Icons.chevron_right, color: isLight ? Colors.black38 : Colors.white54),
          ),
        ),
      ),
    );
  }
}

class TabNavigator extends StatelessWidget {
  final GlobalKey<NavigatorState> navigatorKey;
  final Widget rootPage;

  const TabNavigator({
    super.key,
    required this.navigatorKey,
    required this.rootPage,
  });

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      onGenerateRoute: (routeSettings) {
        return MaterialPageRoute(
          builder: (context) => rootPage,
        );
      },
    );
  }
}

class CoursesTab extends StatefulWidget {
  final ApiService api;
  final Map<String, dynamic>? user;
  final String? lastWatchedCourseId;
  final int lastWatchedLessonIndex;
  final VoidCallback onReloadLastWatched;

  const CoursesTab({
    super.key,
    required this.api,
    required this.user,
    required this.lastWatchedCourseId,
    required this.lastWatchedLessonIndex,
    required this.onReloadLastWatched,
  });

  @override
  State<CoursesTab> createState() => _CoursesTabState();
}

class _CoursesTabState extends State<CoursesTab> {
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final api = widget.api;
    final user = widget.user;

    // Filter courses based on search query and category
    final filteredCourses = api.courses.where((course) {
      final matchesCategory = _selectedCategory == 'All' ||
          course['category']?.toString().toLowerCase() == _selectedCategory.toLowerCase();
      final matchesSearch = _searchQuery.isEmpty ||
          course['title']?.toString().toLowerCase().contains(_searchQuery.toLowerCase()) == true ||
          course['instructor']?.toString().toLowerCase().contains(_searchQuery.toLowerCase()) == true;
      return matchesCategory && matchesSearch;
    }).toList();

    final categories = ['All', 'Prophetic', 'Prayer', 'Warfare', 'Worship', 'Bible Study', 'Healing', 'Leadership', 'Evangelism'];

    return RefreshIndicator(
      onRefresh: () async {
        await api.fetchCourses();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Title
            Text(
              'Online Courses',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: isLight ? const Color(0xFF1E293B) : Colors.white,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Browse prophetic courses and prayer schools',
              style: TextStyle(
                color: isLight ? const Color(0xFF64748B) : Colors.indigo[100],
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 24),

            // Premium Search Bar
            Container(
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: isLight ? Colors.indigo.withOpacity(0.04) : Colors.black.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: TextFormField(
                controller: _searchController,
                style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search courses or instructors...',
                  hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                  prefixIcon: Icon(Icons.search_rounded, color: isLight ? const Color(0xFF64748B) : Colors.white70),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear_rounded, color: isLight ? const Color(0xFF64748B) : Colors.white70),
                          onPressed: () {
                            setState(() {
                              _searchController.clear();
                              _searchQuery = '';
                            });
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: isLight ? Colors.white : const Color(0xFF111E3E),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                  ),
                ),
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val;
                  });
                },
              ),
            ),
            const SizedBox(height: 20),

            // Dynamic Category Filter row
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final isSel = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedCategory = cat;
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSel
                              ? const Color(0xFF6366F1)
                              : (isLight ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B)),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSel
                                ? const Color(0xFF6366F1)
                                : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.12)),
                            width: 1,
                          ),
                          boxShadow: isSel
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFF6366F1).withOpacity(0.2),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  )
                                ]
                              : null,
                        ),
                        child: Text(
                          cat,
                          style: TextStyle(
                            color: isSel ? Colors.white : (isLight ? const Color(0xFF475569) : Colors.white70),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            if (widget.lastWatchedCourseId != null && api.courses.any((c) => c['id'].toString() == widget.lastWatchedCourseId)) ...[
              _buildResumeCourseCard(isLight, api.courses.firstWhere((c) => c['id'].toString() == widget.lastWatchedCourseId)),
            ],

            // Courses List / Empty State
            if (filteredCourses.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.school_outlined,
                      size: 64,
                      color: isLight ? Colors.black26 : Colors.white24,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No courses found',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isLight ? const Color(0xFF475569) : Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Try modifying your search or select another category.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: isLight ? Colors.black38 : Colors.white30,
                      ),
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredCourses.length,
                itemBuilder: (context, idx) {
                  final course = filteredCourses[idx];
                  final isEnrolled = (user?['enrolledCourses'] ?? []).contains(course['id']);
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    color: isLight ? Colors.white : const Color(0xFF111E3E),
                    elevation: 2,
                    shadowColor: isLight ? Colors.indigo.withOpacity(0.04) : Colors.black.withOpacity(0.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                      side: BorderSide(
                        color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.1),
                        width: 1,
                      ),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => CourseDetailScreen(course: course)),
                        );
                        widget.onReloadLastWatched();
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Thumbnail with Badge Overlay
                            Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    course['thumbnail'],
                                    width: 90,
                                    height: 90,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: 4,
                                  left: 4,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFBBF24),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      course['category'].toString().toUpperCase(),
                                      style: const TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 12),
                            
                            // Middle: Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Category/Rating Header
                                  Row(
                                    children: [
                                      const Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                                      const SizedBox(width: 2),
                                      Text(
                                        '${course['rating']}',
                                        style: TextStyle(
                                          color: isLight ? const Color(0xFF475569) : Colors.white70,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        '•  ${course['lessons']} lessons',
                                        style: TextStyle(
                                          color: isLight ? const Color(0xFF64748B) : Colors.white54,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  
                                  // Title
                                  Text(
                                    course['title'],
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                      fontSize: 14,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  
                                  // Instructor
                                  Text(
                                    course['instructor'],
                                    style: TextStyle(
                                      color: isLight ? Colors.indigo[900] : Colors.indigo[100],
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  
                                  // Description or Duration
                                  Text(
                                    course['duration'],
                                    style: TextStyle(
                                      color: isLight ? Colors.black45 : Colors.white38,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            
                            // Right Side: Price and action button
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '₦${course['price'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton(
                                  onPressed: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => CourseDetailScreen(course: course)),
                                    );
                                    widget.onReloadLastWatched();
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isEnrolled ? const Color(0xFF10B981) : const Color(0xFFFBBF24),
                                    foregroundColor: isEnrolled ? Colors.white : const Color(0xFF0F172A),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    elevation: 0,
                                  ),
                                  child: Text(
                                    isEnrolled ? 'Open' : 'Details',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildResumeCourseCard(bool isLight, Map<String, dynamic> resumeCourse) {
    final List<dynamic> videos = resumeCourse['videos'] ?? [];
    final activeLesson = (videos.isNotEmpty && widget.lastWatchedLessonIndex < videos.length)
        ? videos[widget.lastWatchedLessonIndex]
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Resume Learning',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isLight ? const Color(0xFF1E293B) : Colors.white,
          ),
        ),
        const SizedBox(height: 10),
        Card(
          margin: const EdgeInsets.only(bottom: 24),
          color: const Color(0xFF6366F1), // Custom accent background for visibility
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 4,
          shadowColor: const Color(0xFF6366F1).withOpacity(0.3),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => CourseDetailScreen(course: resumeCourse)),
              );
              widget.onReloadLastWatched();
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.network(
                          resumeCourse['thumbnail'],
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              resumeCourse['title'],
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Instructor: ${resumeCourse['instructor']}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFBBF24),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.15),
                              blurRadius: 6,
                              offset: const Offset(0, 3),
                            )
                          ]
                        ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          color: Color(0xFF0F172A),
                          size: 20,
                        ),
                      ),
                    ],
                  ),
                  if (activeLesson != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.play_circle_outline, size: 14, color: Color(0xFFFBBF24)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              activeLesson['title'],
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (videos.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (widget.lastWatchedLessonIndex + 1) / videos.length,
                        backgroundColor: Colors.white24,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFBBF24)),
                        minHeight: 4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Lesson ${widget.lastWatchedLessonIndex + 1} of ${videos.length}',
                          style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11),
                        ),
                        Text(
                          '${((widget.lastWatchedLessonIndex + 1) / videos.length * 100).round()}% Completed',
                          style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
