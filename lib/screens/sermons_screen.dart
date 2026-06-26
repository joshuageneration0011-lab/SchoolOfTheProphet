import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/audio_service.dart';

class SermonsScreen extends StatefulWidget {
  const SermonsScreen({super.key});

  @override
  State<SermonsScreen> createState() => _SermonsScreenState();
}

class _SermonsScreenState extends State<SermonsScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _sermons = [
    {
      'id': 's1',
      'title': 'Walking in Divine Authority',
      'speaker': 'Pastor John Michael',
      'duration': '45:22',
      'thumbnail': 'https://images.unsplash.com/photo-1499750310107-5fef28a67343?w=800&fit=crop&q=80',
      'views': 12400,
      'date': '2025-12-10',
      'description': 'Discover the authority given to every believer through Christ and how to walk in it daily.',
      'category': 'Faith',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    },
    {
      'id': 's2',
      'title': 'The Power of Kingdom Prayer',
      'speaker': 'Pastor Sarah Williams',
      'duration': '38:15',
      'thumbnail': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&fit=crop&q=80',
      'views': 9800,
      'date': '2025-12-03',
      'description': 'Learn the principles of effective prayer that moves mountains and transforms lives.',
      'category': 'Prayer',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-life-is-a-dream-837.mp3',
    },
    {
      'id': 's3',
      'title': 'Breaking Generational Chains',
      'speaker': 'Apostle David Thompson',
      'duration': '52:40',
      'thumbnail': 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&fit=crop&q=80',
      'views': 15600,
      'date': '2025-11-28',
      'description': 'Find freedom from patterns that have held your family line captive for generations.',
      'category': 'Freedom',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3',
    },
    {
      'id': 's4',
      'title': 'Grace That Transforms',
      'speaker': 'Pastor John Michael',
      'duration': '42:10',
      'thumbnail': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&fit=crop&q=80',
      'views': 11200,
      'date': '2025-11-20',
      'description': 'Understanding the radical grace of God that doesn\'t just forgive but transforms.',
      'category': 'Grace',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-spirit-of-the-groove-109.mp3',
    },
    {
      'id': 's5',
      'title': 'Rising in Unshakable Faith',
      'speaker': 'Minister Rachel Grace',
      'duration': '35:50',
      'thumbnail': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&fit=crop&q=80',
      'views': 8700,
      'date': '2025-11-15',
      'description': 'Build a faith that stands firm no matter what storms life brings your way.',
      'category': 'Faith',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-elevator-music-973.mp3',
    },
    {
      'id': 's6',
      'title': 'The Season of Harvest',
      'speaker': 'Pastor Sarah Williams',
      'duration': '48:30',
      'thumbnail': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&fit=crop&q=80',
      'views': 13200,
      'date': '2025-11-08',
      'description': 'Recognize the season you\'re in and position yourself for the harvest God is bringing.',
      'category': 'Season',
      'audioUrl': 'https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3',
    },
  ];

  final List<String> _categories = ['All', 'Faith', 'Prayer', 'Freedom', 'Grace', 'Season'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final audio = Provider.of<AudioService>(context);

    final filteredSermons = _sermons.where((sermon) {
      final matchesCategory =
          _selectedCategory == 'All' || sermon['category'] == _selectedCategory;
      final matchesSearch =
          sermon['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          sermon['speaker'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    final isLight = Theme.of(context).brightness == Brightness.light;

    return Scaffold(
      backgroundColor: isLight ? Colors.white : Colors.transparent,
      appBar: AppBar(
        title: Text(
          'Anointed Sermons',
          style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
        ),
        backgroundColor: isLight ? Colors.white : Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: isLight ? const Color(0xFF1E293B) : Colors.white),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
              decoration: InputDecoration(
                hintText: 'Search sermons or speakers...',
                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                prefixIcon: Icon(Icons.search, color: isLight ? Colors.black38 : Colors.white38),
                filled: true,
                fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Category chips
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFFBBF24)
                          : (isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05)),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Text(
                        cat,
                        style: TextStyle(
                          color: isSelected
                              ? const Color(0xFF0F172A)
                              : (isLight ? const Color(0xFF1E293B) : Colors.white70),
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

          const SizedBox(height: 12),

          // Sermon list
          Expanded(
            child: filteredSermons.isEmpty
                ? Center(
                    child: Text(
                      'No sermons found matching your criteria.',
                      style: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    itemCount: filteredSermons.length,
                    itemBuilder: (context, idx) {
                      final sermon = filteredSermons[idx];
                      final isCurrent = audio.currentSermon?['id'] == sermon['id'];

                      return Card(
                        color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.03),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isCurrent
                                ? const Color(0xFFFBBF24).withOpacity(0.4)
                                : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05)),
                            width: isCurrent ? 1.5 : 1,
                          ),
                        ),
                        margin: const EdgeInsets.only(bottom: 16),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () => audio.playSermon(sermon),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              children: [
                                // Thumbnail with playing indicator overlay
                                Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        sermon['thumbnail'],
                                        width: 80,
                                        height: 80,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          width: 80,
                                          height: 80,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF4F46E5),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(Icons.music_note,
                                              color: Colors.white, size: 36),
                                        ),
                                      ),
                                    ),
                                    if (isCurrent && audio.isPlaying)
                                      Positioned.fill(
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: Colors.black.withOpacity(0.4),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(
                                            Icons.equalizer_rounded,
                                            color: Color(0xFFFBBF24),
                                            size: 32,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(width: 16),

                                // Details
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFBBF24)
                                                  .withOpacity(0.1),
                                              borderRadius:
                                                  BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              sermon['category'],
                                              style: const TextStyle(
                                                  color: Color(0xFFFBBF24),
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          Text(
                                            sermon['duration'],
                                            style: TextStyle(
                                                color: isLight ? Colors.black38 : Colors.white38,
                                                fontSize: 11),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        sermon['title'],
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                            fontSize: 14),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        sermon['speaker'],
                                        style: TextStyle(
                                            color: isLight ? Colors.indigo[900] : Colors.indigo[100],
                                            fontSize: 12),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        sermon['description'],
                                        style: TextStyle(
                                            color: isLight ? Colors.black45 : Colors.white38, fontSize: 11),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(width: 8),
                                // Play/pause icon
                                Icon(
                                  isCurrent && audio.isPlaying
                                      ? Icons.pause_circle_filled
                                      : Icons.play_circle_fill,
                                  color: isCurrent
                                      ? const Color(0xFFFBBF24)
                                      : (isLight ? Colors.black26 : Colors.white54),
                                  size: 36,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
