import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class CourseDetailScreen extends StatefulWidget {
  final Map<String, dynamic> course;
  const CourseDetailScreen({super.key, required this.course});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _activeLessonIndex = 0;
  YoutubePlayerController? _ytController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initAndLoadData();
  }

  Future<void> _initAndLoadData() async {
    await _loadSavedLessonIndex();
    await _saveLastWatched();
  }

  void _initYoutubeController(String videoId) {
    if (_ytController != null) return;
    _ytController = YoutubePlayerController.fromVideoId(
      videoId: videoId,
      autoPlay: false,
      params: const YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: true,
        showVideoAnnotations: false,
      ),
    );
  }

  String? _convertUrlToId(String url) {
    if (url.isEmpty) return null;
    RegExp regExp = RegExp(
      r'^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*',
      caseSensitive: false,
      multiLine: false,
    );
    Match? match = regExp.firstMatch(url);
    if (match != null && match.groupCount >= 2) {
      final id = match.group(2);
      if (id != null && id.length == 11) {
        return id;
      }
    }
    return null;
  }

  Future<void> _loadSavedLessonIndex() async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'];
      if (userId != null) {
        final prefs = await SharedPreferences.getInstance();
        final savedIdx = prefs.getInt('last_watched_lesson_index_${widget.course['id']}_$userId');
        final List<dynamic> videos = widget.course['videos'] ?? [];
        if (savedIdx != null && savedIdx < videos.length) {
          setState(() {
            _activeLessonIndex = savedIdx;
          });
        }
        
        // Initialize player controller after loading the saved index
        final user = apiService.currentUser;
        final isEnrolled = (user?['enrolledCourses'] ?? []).contains(widget.course['id']);
        if (isEnrolled && videos.isNotEmpty && _ytController == null) {
          final videoId = _convertUrlToId(videos[_activeLessonIndex]['url'] ?? '');
          if (videoId != null) {
            _initYoutubeController(videoId);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _saveLastWatched() async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = apiService.currentUser?['id'];
      if (userId != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('last_watched_course_id_$userId', widget.course['id'].toString());
        await prefs.setInt('last_watched_lesson_index_${widget.course['id']}_$userId', _activeLessonIndex);
      }
    } catch (e) {
      // Ignore
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _ytController?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final apiService = Provider.of<ApiService>(context);
    final user = apiService.currentUser;
    final course = widget.course;
    final isEnrolled = (user?['enrolledCourses'] ?? []).contains(course['id']);
    final List<dynamic> videos = course['videos'] ?? [];
    final isLight = Theme.of(context).brightness == Brightness.light;

    if (isEnrolled && videos.isNotEmpty && _ytController == null) {
      final videoId = _convertUrlToId(videos[_activeLessonIndex]['url'] ?? '');
      if (videoId != null) {
        Future.microtask(() {
          if (mounted) {
            setState(() {
              _initYoutubeController(videoId);
            });
          }
        });
      }
    }

    return Scaffold(
      backgroundColor: isLight ? Colors.white : const Color(0xFF070B19),
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded,
              color: isLight ? const Color(0xFF1E293B) : Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(course['title'], style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white)),
        backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
        foregroundColor: isLight ? const Color(0xFF1E293B) : Colors.white,
        iconTheme: IconThemeData(color: isLight ? const Color(0xFF1E293B) : Colors.white),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Player Area / Header Image
            if (isEnrolled && videos.isNotEmpty && _ytController != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: YoutubePlayer(
                  controller: _ytController!,
                ),
              )
            else
              Stack(
                alignment: Alignment.center,
                children: [
                  Image.network(
                    course['thumbnail'],
                    height: 220,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                  Container(
                    height: 220,
                    color: Colors.black.withOpacity(0.4),
                  ),
                  if (!isEnrolled)
                    Positioned.fill(
                      child: Container(
                        color: Colors.black.withOpacity(0.65),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.lock_rounded, size: 54, color: Color(0xFFFBBF24)),
                            const SizedBox(height: 12),
                            const Text(
                              'Unlock this Course to access all lessons',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    // Play Button fallback
                    IconButton(
                      icon: const Icon(Icons.play_circle_fill, size: 64, color: Color(0xFFFBBF24)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Playing lesson: ${videos.isNotEmpty ? videos[_activeLessonIndex]['title'] : "Introduction"}')),
                        );
                      },
                    ),
                ],
              ),

            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and details
                  Text(
                    course['category'].toString().toUpperCase(),
                    style: const TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    course['title'],
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        '${course['rating']} • ${course['students'] ?? 14500} Students',
                        style: TextStyle(color: isLight ? Colors.black54 : Colors.white70, fontSize: 13),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Instructor: ${course['instructor']}',
                    style: TextStyle(color: isLight ? Colors.indigo[900] : Colors.indigo[100], fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 24),
                  
                  // Tab controllers
                  TabBar(
                    controller: _tabController,
                    indicatorColor: const Color(0xFFFBBF24),
                    labelColor: const Color(0xFFFBBF24),
                    unselectedLabelColor: isLight ? Colors.black45 : Colors.white54,
                    tabs: const [
                      Tab(text: 'Overview'),
                      Tab(text: 'Lessons'),
                      Tab(text: 'Details'),
                    ],
                  ),
                  
                  // Tab contents
                  SizedBox(
                    height: 350,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Overview Tab
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Description', style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 16)),
                              const SizedBox(height: 8),
                              Text(
                                course['description'],
                                style: TextStyle(color: isLight ? Colors.black54 : Colors.white60, fontSize: 14, height: 1.5),
                              ),
                            ],
                          ),
                        ),

                        // Curriculum / Lessons Tab
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: videos.isEmpty
                              ? Center(child: Text('No lessons recorded yet.', style: TextStyle(color: isLight ? Colors.black38 : Colors.white60)))
                              : ListView.builder(
                                  itemCount: videos.length,
                                  itemBuilder: (context, idx) {
                                    final v = videos[idx];
                                    final isActive = _activeLessonIndex == idx;
                                    return Card(
                                      color: isActive
                                          ? (isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.08))
                                          : Colors.transparent,
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      child: ListTile(
                                        leading: Icon(
                                          isEnrolled && isActive ? Icons.play_arrow : Icons.lock_outline,
                                          color: isEnrolled && isActive ? const Color(0xFFFBBF24) : (isLight ? Colors.black26 : Colors.white24),
                                        ),
                                        title: Text(
                                          v['title'],
                                          style: TextStyle(
                                            color: isLight
                                                ? (isEnrolled && isActive ? const Color(0xFF1E293B) : Colors.black87)
                                                : (isEnrolled && isActive ? Colors.white : Colors.white70),
                                            fontWeight: isEnrolled && isActive ? FontWeight.bold : FontWeight.normal,
                                            fontSize: 14,
                                          ),
                                        ),
                                        subtitle: Text(v['duration'] ?? '', style: TextStyle(color: isLight ? Colors.black45 : Colors.white30, fontSize: 12)),
                                        trailing: isEnrolled && isActive ? const Text('Playing', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 11)) : null,
                                        onTap: () {
                                          if (!isEnrolled) {
                                            _showPaymentSheet(context, apiService, course);
                                          } else {
                                            setState(() {
                                              _activeLessonIndex = idx;
                                            });
                                            _saveLastWatched();
                                            final videoId = _convertUrlToId(v['url'] ?? '');
                                            if (videoId != null) {
                                              if (_ytController != null) {
                                                _ytController!.loadVideoById(videoId: videoId);
                                              } else {
                                                _initYoutubeController(videoId);
                                              }
                                            }
                                          }
                                        },
                                      ),
                                    );
                                  },
                                ),
                        ),

                        // Details (Requirements / What you learn) Tab
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: ListView(
                            children: [
                              Text('What You Learn', style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 16)),
                              const SizedBox(height: 8),
                              ...((course['whatYouLearn'] as List? ?? []).map((item) => Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.check, color: Colors.green, size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(item, style: TextStyle(color: isLight ? Colors.black87 : Colors.white60, fontSize: 14))),
                                    ],
                                  ))),
                              const SizedBox(height: 20),
                              Text('Requirements', style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 16)),
                              const SizedBox(height: 8),
                              ...((course['requirements'] as List? ?? []).map((item) => Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.circle, color: Color(0xFFFBBF24), size: 6),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(item, style: TextStyle(color: isLight ? Colors.black87 : Colors.white60, fontSize: 14))),
                                    ],
                                  ))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: !isEnrolled
          ? SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: isLight ? Colors.white : const Color(0xFF111E3E),
                  border: Border(
                    top: BorderSide(
                      color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.06),
                      width: 1,
                    ),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Price to unlock',
                          style: TextStyle(
                            color: isLight ? const Color(0xFF64748B) : Colors.white60,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₦${course['price'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFFFBBF24),
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () => _showPaymentSheet(context, apiService, course),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFBBF24),
                        foregroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Pay & Unlock Course',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }

  void _showPaymentSheet(BuildContext context, ApiService apiService, Map<String, dynamic> course) {
    if (apiService.currentUser == null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      return;
    }
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      builder: (ctx) {
        String selectedMethod = 'card';
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 50,
                      height: 5,
                      decoration: BoxDecoration(
                        color: isLight ? Colors.black12 : Colors.white12,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Icon(Icons.lock_outline, color: Color(0xFFFBBF24), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'SECURE CHECKOUT',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isLight ? Colors.black54 : Colors.white70,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    course['title'],
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isLight ? const Color(0xFF1E293B) : Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₦${course['price'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFFBBF24),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Select Payment Method',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isLight ? Colors.black54 : Colors.white60,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildPaymentMethodOption(
                    title: 'Pay with Card',
                    subtitle: 'Visa, Mastercard, Verve',
                    icon: Icons.credit_card_rounded,
                    isSelected: selectedMethod == 'card',
                    isLight: isLight,
                    onTap: () {
                      setModalState(() {
                        selectedMethod = 'card';
                      });
                    },
                  ),
                  const SizedBox(height: 10),
                  _buildPaymentMethodOption(
                    title: 'Bank Transfer',
                    subtitle: 'Instant transfer validation',
                    icon: Icons.account_balance_rounded,
                    isSelected: selectedMethod == 'bank',
                    isLight: isLight,
                    onTap: () {
                      setModalState(() {
                        selectedMethod = 'bank';
                      });
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (context) => AlertDialog(
                            backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const SizedBox(height: 16),
                                const CircularProgressIndicator(color: Color(0xFFFBBF24)),
                                const SizedBox(height: 20),
                                Text(
                                  'Processing payment...',
                                  style: TextStyle(
                                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Please wait, validating with bank secure server...',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: isLight ? Colors.black54 : Colors.white60,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 16),
                              ],
                            ),
                          ),
                        );

                        await Future.delayed(const Duration(seconds: 2));
                        
                        if (context.mounted) {
                          Navigator.pop(context);
                        }

                        final success = await apiService.enrollInCourse(course['id']);
                        
                        if (success && context.mounted) {
                          final List<dynamic> courseVideos = course['videos'] ?? [];
                          if (courseVideos.isNotEmpty) {
                            final videoId = _convertUrlToId(courseVideos[_activeLessonIndex]['url'] ?? '');
                            if (videoId != null) {
                              _initYoutubeController(videoId);
                            }
                          }
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              backgroundColor: isLight ? Colors.white : const Color(0xFF111E3E),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withOpacity(0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.check_circle_rounded,
                                      color: Colors.green,
                                      size: 54,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  Text(
                                    'Access Granted!',
                                    style: TextStyle(
                                      color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Payment validated. The course has been successfully unlocked.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: isLight ? Colors.black54 : Colors.white60,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  ElevatedButton(
                                    onPressed: () => Navigator.pop(context),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFFBBF24),
                                      foregroundColor: const Color(0xFF0F172A),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                    ),
                                    child: const Text('Start Learning', style: TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(height: 8),
                                ],
                              ),
                            ),
                          );
                        } else if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Payment failed or cancelled. Please try again.')),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFBBF24),
                        foregroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Complete Payment',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPaymentMethodOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required bool isLight,
    required VoidCallback onTap,
  }) {
    return Material(
      color: isSelected
          ? const Color(0xFF6366F1).withOpacity(isLight ? 0.08 : 0.15)
          : Colors.transparent,
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: isSelected ? const Color(0xFF6366F1) : (isLight ? Colors.black12 : Colors.white12),
          width: isSelected ? 1.5 : 1,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Icon(
          icon,
          color: isSelected ? const Color(0xFF6366F1) : (isLight ? Colors.black54 : Colors.white60),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isLight ? const Color(0xFF1E293B) : Colors.white,
            fontSize: 14,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            color: isLight ? Colors.black45 : Colors.white30,
            fontSize: 12,
          ),
        ),
        trailing: Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: isSelected ? const Color(0xFF6366F1) : (isLight ? Colors.black26 : Colors.white24),
              width: 2,
            ),
            color: isSelected ? const Color(0xFF6366F1) : Colors.transparent,
          ),
          child: isSelected
              ? const Icon(Icons.check, size: 12, color: Colors.white)
              : null,
        ),
        onTap: onTap,
      ),
    );
  }
}
