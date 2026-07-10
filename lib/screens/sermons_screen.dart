import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/audio_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class SermonsScreen extends StatefulWidget {
  const SermonsScreen({super.key});

  @override
  State<SermonsScreen> createState() => _SermonsScreenState();
}

class _SermonsScreenState extends State<SermonsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);
    final audio = Provider.of<AudioService>(context);
    final user = api.currentUser;
    final isLight = Theme.of(context).brightness == Brightness.light;

    // Scan all categories from the audios list
    final List<String> categories = ['All'];
    for (final a in api.audios) {
      final cat = a['category'] as String? ?? '';
      if (cat.isNotEmpty && !categories.contains(cat)) {
        categories.add(cat);
      }
    }

    final filteredAudios = api.audios.where((item) {
      final matchesCategory = _selectedCategory == 'All' || item['category'] == _selectedCategory;
      final titleLower = (item['title'] as String? ?? '').toLowerCase();
      final artistLower = (item['artist'] as String? ?? '').toLowerCase();
      final searchLower = _searchQuery.toLowerCase();
      final matchesSearch = titleLower.contains(searchLower) || artistLower.contains(searchLower);
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: isLight ? Colors.white : Colors.transparent,
      appBar: AppBar(
        leading: Navigator.canPop(context)
            ? IconButton(
                icon: Icon(Icons.arrow_back_ios_new_rounded,
                    color: isLight ? const Color(0xFF1E293B) : Colors.white),
                onPressed: () => Navigator.pop(context),
              )
            : null,
        title: Text(
          'Audio Sanctuary',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isLight ? const Color(0xFF1E293B) : Colors.white,
            fontSize: 20,
          ),
        ),
        backgroundColor: isLight ? Colors.white : Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: isLight ? const Color(0xFF1E293B) : Colors.white),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: isLight ? const Color(0xFF1E293B) : Colors.white),
            onPressed: () => api.fetchAudios(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Subtitle / Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            alignment: Alignment.centerLeft,
            child: Text(
              'Access anointed messages and spiritual training materials.',
              style: TextStyle(
                color: isLight ? Colors.black54 : Colors.white70,
                fontSize: 12,
              ),
            ),
          ),

          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
              decoration: InputDecoration(
                hintText: 'Search audio messages...',
                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                prefixIcon: Icon(Icons.search, color: isLight ? Colors.black38 : Colors.white38),
                filled: true,
                fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),

          // Category chips
          if (categories.length > 1)
            SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: categories.length,
                itemBuilder: (context, idx) {
                  final cat = categories[idx];
                  final isSelected = _selectedCategory == cat;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedCategory = cat),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFFFBBF24)
                            : (isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05)),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFFBBF24).withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                )
                              ]
                            : null,
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

          const SizedBox(height: 16),

          // Audio store catalog list
          Expanded(
            child: api.isLoading && api.audios.isEmpty
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFBBF24)),
                    ),
                  )
                : filteredAudios.isEmpty
                    ? Center(
                        child: Text(
                          'No audio courses found.',
                          style: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        itemCount: filteredAudios.length,
                        itemBuilder: (context, idx) {
                          final audioItem = filteredAudios[idx];
                          final audioId = audioItem['id'].toString();
                          final bool isPurchased = user != null &&
                              (user['purchasedAudios'] as List<dynamic>?)?.contains(audioId) == true;

                          return _buildAudioStoreItem(context, audioItem, isPurchased, isLight, audio, api);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildAudioStoreItem(
    BuildContext context,
    Map<String, dynamic> audioItem,
    bool isPurchased,
    bool isLight,
    AudioService audioService,
    ApiService apiService,
  ) {
    final title = audioItem['title'] ?? 'Prophetic Audio';
    final artist = audioItem['artist'] ?? 'SOP Academy';
    final coverUrl = audioItem['coverUrl'] ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop';
    final description = audioItem['description'] ?? 'Anointed message';
    final duration = audioItem['duration'] ?? '1 hr';
    final double price = (audioItem['price'] is num) ? (audioItem['price'] as num).toDouble() : 0.0;
    final double? originalPrice = (audioItem['originalPrice'] is num) ? (audioItem['originalPrice'] as num).toDouble() : null;
    final List<dynamic> tracks = audioItem['tracks'] ?? [];

    return Card(
      color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.03),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05),
          width: 1,
        ),
      ),
      margin: const EdgeInsets.only(bottom: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image with Lock Overlay if locked
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    coverUrl,
                    width: 90,
                    height: 90,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                        ),
                      ),
                      child: const Icon(Icons.music_note_rounded, color: Colors.white, size: 40),
                    ),
                  ),
                ),
                if (!isPurchased)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Center(
                        child: Icon(Icons.lock_rounded, color: Colors.white, size: 28),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 16),

            // Metadata Detail
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Duration
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFBBF24).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          audioItem['category'] ?? 'Sanctuary',
                          style: const TextStyle(
                            color: Color(0xFFD97706),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(
                        '$duration · ${tracks.length} tracks',
                        style: TextStyle(
                          color: isLight ? Colors.black45 : Colors.white54,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isLight ? const Color(0xFF0F172A) : Colors.white,
                      fontSize: 15,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),

                  // Speaker/Artist
                  Text(
                    artist,
                    style: TextStyle(
                      color: isLight ? const Color(0xFF4F46E5) : const Color(0xFF818CF8),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Description snippet
                  Text(
                    description,
                    style: TextStyle(
                      color: isLight ? Colors.black54 : Colors.white38,
                      fontSize: 11,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Dynamic Lock/Purchase state row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Price display or Unlock label
                      if (!isPurchased)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (originalPrice != null)
                              Text(
                                '₦${originalPrice.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  decoration: TextDecoration.lineThrough,
                                  color: Colors.grey,
                                  fontSize: 11,
                                ),
                              ),
                            Text(
                              '₦${price.toStringAsFixed(0)}',
                              style: TextStyle(
                                color: isLight ? const Color(0xFF0F172A) : const Color(0xFFFBBF24),
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        )
                      else
                        const Row(
                          children: [
                            Icon(Icons.check_circle_rounded, color: Colors.green, size: 18),
                            SizedBox(width: 4),
                            Text(
                              'Purchased',
                              style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),

                      // Button
                      ElevatedButton(
                        onPressed: () {
                          if (isPurchased) {
                            _showPlaylistBottomSheet(context, audioItem, audioService, isLight);
                          } else {
                            _showCheckoutBottomSheet(context, audioItem, apiService, isLight);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPurchased ? const Color(0xFF4F46E5) : const Color(0xFFFBBF24),
                          foregroundColor: isPurchased ? Colors.white : const Color(0xFF0F172A),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          isPurchased ? 'Listen Now' : 'Buy Now',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
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
    );
  }

  void _showPlaylistBottomSheet(
    BuildContext context,
    Map<String, dynamic> audioItem,
    AudioService audioService,
    bool isLight,
  ) {
    final title = audioItem['title'] ?? '';
    final artist = audioItem['artist'] ?? '';
    final coverUrl = audioItem['coverUrl'] ?? '';
    final List<dynamic> tracks = audioItem['tracks'] ?? [];

    showModalBottomSheet(
      context: context,
      backgroundColor: isLight ? Colors.white : const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return StatefulBuilder(builder: (context, setModalState) {
          return Consumer<AudioService>(
            builder: (context, currentAudio, _) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle line
                    Center(
                      child: Container(
                        width: 48,
                        height: 5,
                        decoration: BoxDecoration(
                          color: isLight ? Colors.black.withOpacity(0.08) : Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Header Info
                    Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.network(
                            coverUrl,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 60,
                              height: 60,
                              color: const Color(0xFF4F46E5),
                              child: const Icon(Icons.music_note, color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: isLight ? const Color(0xFF0F172A) : Colors.white,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                artist,
                                style: const TextStyle(color: Colors.grey, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    Text(
                      'Playlist (${tracks.length} tracks)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: isLight ? const Color(0xFF0F172A) : Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Tracks List
                    Flexible(
                      child: tracks.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.symmetric(vertical: 24.0),
                              child: Center(child: Text('No tracks available for this course.')),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              itemCount: tracks.length,
                              itemBuilder: (context, idx) {
                                final track = tracks[idx];
                                final trackTitle = track['title'] ?? 'Track ${idx + 1}';
                                final trackDuration = track['duration'] ?? '10:00';
                                final rawUrl = track['url'] ?? '';
                                final trackUrl = rawUrl.isEmpty
                                    ? ''
                                    : (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
                                        ? rawUrl
                                        : '${ApiService.baseUrl.replaceAll('/api', '')}${rawUrl.startsWith('/') ? '' : '/'}$rawUrl');

                                final bool isCurrentTrackPlaying = currentAudio.currentSermon != null &&
                                    currentAudio.currentSermon!['audioUrl'] == trackUrl &&
                                    currentAudio.isPlaying;

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    color: isCurrentTrackPlaying
                                        ? const Color(0xFFFBBF24).withOpacity(0.08)
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isCurrentTrackPlaying
                                          ? const Color(0xFFFBBF24).withOpacity(0.3)
                                          : Colors.transparent,
                                      width: 1,
                                    ),
                                  ),
                                  child: ListTile(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                                    leading: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: isCurrentTrackPlaying
                                            ? const Color(0xFFFBBF24)
                                            : (isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05)),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: isCurrentTrackPlaying
                                            ? const Icon(Icons.equalizer_rounded, color: Color(0xFF0F172A), size: 18)
                                            : Text(
                                                '${idx + 1}',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                  color: isLight ? const Color(0xFF0F172A) : Colors.white70,
                                                ),
                                              ),
                                      ),
                                    ),
                                    title: Text(
                                      trackTitle,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: isCurrentTrackPlaying
                                            ? const Color(0xFFFBBF24)
                                            : (isLight ? const Color(0xFF0F172A) : Colors.white),
                                      ),
                                    ),
                                    subtitle: Text(
                                      trackDuration,
                                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                                    ),
                                    trailing: Icon(
                                      isCurrentTrackPlaying
                                          ? Icons.pause_circle_filled_rounded
                                          : Icons.play_circle_fill_rounded,
                                      color: isCurrentTrackPlaying
                                          ? const Color(0xFFFBBF24)
                                          : (isLight ? const Color(0xFF4F46E5) : const Color(0xFF818CF8)),
                                      size: 32,
                                    ),
                                    onTap: () {
                                      currentAudio.playSermon({
                                        'id': track['id'] ?? '${audioItem['id']}_$idx',
                                        'title': trackTitle,
                                        'speaker': artist,
                                        'audioUrl': trackUrl,
                                        'thumbnail': coverUrl,
                                        'category': audioItem['category'] ?? 'Sanctuary',
                                        'duration': trackDuration,
                                      });
                                    },
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              );
            },
          );
        });
      },
    );
  }

  void _showCheckoutBottomSheet(
    BuildContext context,
    Map<String, dynamic> audioItem,
    ApiService apiService,
    bool isLight,
  ) {
    if (apiService.currentUser == null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      return;
    }

    final title = audioItem['title'] ?? '';
    final double price = (audioItem['price'] is num) ? (audioItem['price'] as num).toDouble() : 0.0;
    String activeMethod = 'card'; // 'card' or 'bank'
    bool isProcessing = false;
    bool isSuccess = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isLight ? Colors.white : const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            if (isSuccess) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.green, size: 72),
                    const SizedBox(height: 18),
                    const Text(
                      'Payment Successful!',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.green),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You have successfully unlocked "$title".',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: isLight ? Colors.black54 : Colors.white70, fontSize: 14),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4F46E5),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('Back to Sanctuary', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              );
            }

            if (isProcessing) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 50,
                      height: 50,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFBBF24)),
                        strokeWidth: 4,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Securing Transaction...',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please wait while we verify your purchase credentials.',
                      style: TextStyle(color: isLight ? Colors.black45 : Colors.white38, fontSize: 12),
                    ),
                  ],
                ),
              );
            }

            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle line
                  Center(
                    child: Container(
                      width: 48,
                      height: 5,
                      decoration: BoxDecoration(
                        color: isLight ? Colors.black.withOpacity(0.08) : Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  const Text(
                    'Secure Checkout',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Complete payment to unlock your audio content.',
                    style: TextStyle(color: isLight ? Colors.black45 : Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(height: 20),

                  // Item details summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.04)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '₦${price.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFFFBBF24)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  const Text(
                    'Select Payment Method',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 12),

                  // Method Selection (Card / Bank)
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setSheetState(() => activeMethod = 'card'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: activeMethod == 'card'
                                  ? const Color(0xFFFBBF24).withOpacity(0.08)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: activeMethod == 'card'
                                    ? const Color(0xFFFBBF24)
                                    : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05)),
                                width: 1.5,
                              ),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.credit_card_rounded,
                                    color: activeMethod == 'card'
                                        ? const Color(0xFFFBBF24)
                                        : (isLight ? Colors.black54 : Colors.white60)),
                                const SizedBox(height: 8),
                                const Text('Pay with Card',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setSheetState(() => activeMethod = 'bank'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: activeMethod == 'bank'
                                  ? const Color(0xFFFBBF24).withOpacity(0.08)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: activeMethod == 'bank'
                                    ? const Color(0xFFFBBF24)
                                    : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05)),
                                width: 1.5,
                              ),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.account_balance_rounded,
                                    color: activeMethod == 'bank'
                                        ? const Color(0xFFFBBF24)
                                        : (isLight ? Colors.black54 : Colors.white60)),
                                const SizedBox(height: 8),
                                const Text('Bank Transfer',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Form Details (Simulated)
                  if (activeMethod == 'card') ...[
                    TextFormField(
                      initialValue: '4000 1234 5678 9010',
                      decoration: const InputDecoration(
                        labelText: 'Card Number',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.credit_card),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: '12/29',
                            decoration: const InputDecoration(
                              labelText: 'Expiry Date',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            initialValue: '777',
                            obscureText: true,
                            decoration: const InputDecoration(
                              labelText: 'CVV',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Bank Name: WEMA Bank (SOP Academy)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          SizedBox(height: 4),
                          Text('Account Number: 1012345678',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFFFBBF24))),
                          SizedBox(height: 4),
                          Text('Reference: SOP-AUDIO-AUTO-GEN', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: BorderSide(color: isLight ? Colors.grey[300]! : Colors.white10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Text('Cancel',
                              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white)),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () async {
                            setSheetState(() {
                              isProcessing = true;
                            });

                            // Simulate network authorization delay
                            await Future.delayed(const Duration(milliseconds: 1500));

                            // Complete transaction on REST API
                            final success = await apiService.purchaseAudio(audioItem['id'].toString());

                            if (success) {
                              setSheetState(() {
                                isProcessing = false;
                                isSuccess = true;
                              });
                            } else {
                              setSheetState(() {
                                isProcessing = false;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Transaction validation failed. Please check network and try again.'),
                                  backgroundColor: Colors.redAccent,
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFBBF24),
                            foregroundColor: const Color(0xFF0F172A),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Text(
                            activeMethod == 'card' ? 'Pay ₦${price.toStringAsFixed(0)}' : 'I have transferred',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
