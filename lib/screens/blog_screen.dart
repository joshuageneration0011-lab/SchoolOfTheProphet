import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class BlogScreen extends StatefulWidget {
  const BlogScreen({super.key});

  @override
  State<BlogScreen> createState() => _BlogScreenState();
}

class _BlogScreenState extends State<BlogScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Prophecy', 'Prayer', 'Revelation'];
  int _currentPage = 0;
  static const int _postsPerPage = 5;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);
    final isLight = Theme.of(context).brightness == Brightness.light;

    final filteredPosts = api.blogPosts.where((post) {
      final matchesCategory = _selectedCategory == 'All' ||
          post['category'].toString().toLowerCase() == _selectedCategory.toLowerCase();
      final matchesSearch = post['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          post['subtitle'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          post['author'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    final totalPages = (filteredPosts.length / _postsPerPage).ceil().clamp(1, 999);
    final safePage = _currentPage.clamp(0, totalPages - 1);
    final start = safePage * _postsPerPage;
    final end = (start + _postsPerPage).clamp(0, filteredPosts.length);
    final pagedPosts = filteredPosts.sublist(start, end);

    return Scaffold(
      backgroundColor: isLight ? Colors.white : const Color(0xFF0F172A),
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded,
              color: isLight ? const Color(0xFF1E293B) : Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Prophetic Blog',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 22,
            letterSpacing: -0.5,
            color: isLight ? const Color(0xFF1E293B) : Colors.white,
          ),
        ),
        backgroundColor: isLight ? Colors.white : const Color(0xFF1E1B4B),
        elevation: 0,
        iconTheme: IconThemeData(color: isLight ? const Color(0xFF1E293B) : Colors.white),
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() {
                _searchQuery = val;
                _currentPage = 0;
              }),
              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
              decoration: InputDecoration(
                hintText: 'Search revelations or teachings...',
                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white38),
                prefixIcon: Icon(Icons.search, color: isLight ? Colors.black38 : Colors.white38),
                filled: true,
                fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // Categories horizontal list
          SizedBox(
            height: 60,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              itemCount: _categories.length,
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(
                      cat,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected
                            ? const Color(0xFF0F172A)
                            : (isLight ? const Color(0xFF4F46E5) : Colors.indigo[100]),
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedCategory = cat;
                          _currentPage = 0;
                        });
                      }
                    },
                    selectedColor: const Color(0xFFFBBF24),
                    backgroundColor: isLight ? const Color(0xFFEEF2F6) : const Color(0xFF1E1B4B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    side: BorderSide.none,
                  ),
                );
              },
            ),
          ),

          // Posts List
          Expanded(
            child: filteredPosts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.feed_outlined, size: 48, color: isLight ? Colors.black26 : Colors.white24),
                        const SizedBox(height: 12),
                        Text(
                          'No blog posts found.',
                          style: TextStyle(color: isLight ? Colors.black54 : Colors.white54, fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                    itemCount: pagedPosts.length,
                    itemBuilder: (context, idx) {
                      final post = pagedPosts[idx];
                      final liked = post['likedByUser'] ?? false;
                      final likesCount = post['likes'] ?? 0;
                      final commentsCount = (post['comments'] as List?)?.length ?? 0;

                      return Card(
                        color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.03),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05),
                            width: 1,
                          ),
                        ),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => BlogDetailScreen(postId: post['id']),
                              ),
                            );
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              children: [
                                // Square thumbnail
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    post['thumbnail'],
                                    width: 72,
                                    height: 72,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 72,
                                      height: 72,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF8B5CF6),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.article_rounded, color: Colors.white, size: 30),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),

                                // Text details
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFBBF24).withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              post['category'],
                                              style: const TextStyle(
                                                color: Color(0xFFFBBF24),
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Text(
                                            post['readTime'],
                                            style: TextStyle(
                                              color: isLight ? Colors.black38 : Colors.white38,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 5),
                                      Text(
                                        post['title'],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        post['author'],
                                        style: TextStyle(
                                          color: isLight ? Colors.indigo[900] : Colors.indigo[100],
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              post['subtitle'],
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                color: isLight ? Colors.black45 : Colors.white38,
                                                fontSize: 11,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          Icon(
                                            liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                            size: 12,
                                            color: liked ? Colors.red : (isLight ? Colors.black38 : Colors.white38),
                                          ),
                                          const SizedBox(width: 3),
                                          Text(
                                            '$likesCount',
                                            style: TextStyle(fontSize: 10, color: isLight ? Colors.black45 : Colors.white54),
                                          ),
                                          const SizedBox(width: 8),
                                          Icon(
                                            Icons.chat_bubble_outline_rounded,
                                            size: 12,
                                            color: isLight ? Colors.black38 : Colors.white38,
                                          ),
                                          const SizedBox(width: 3),
                                          Text(
                                            '$commentsCount',
                                            style: TextStyle(fontSize: 10, color: isLight ? Colors.black45 : Colors.white54),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(width: 8),
                                // Arrow icon
                                Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  size: 14,
                                  color: isLight ? Colors.black26 : Colors.white38,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Pagination bar — only show when more than one page
          if (filteredPosts.length > _postsPerPage)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Prev
                  _PaginationButton(
                    icon: Icons.chevron_left_rounded,
                    enabled: safePage > 0,
                    isLight: isLight,
                    onTap: () => setState(() => _currentPage = safePage - 1),
                  ),
                  const SizedBox(width: 6),
                  // Page number pills
                  ...List.generate(totalPages, (i) {
                    final isActive = i == safePage;
                    return GestureDetector(
                      onTap: () => setState(() => _currentPage = i),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: isActive ? 32 : 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFFFBBF24)
                              : (isLight ? const Color(0xFFEEF2F6) : Colors.white.withOpacity(0.07)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${i + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isActive
                                ? const Color(0xFF0F172A)
                                : (isLight ? Colors.black54 : Colors.white54),
                          ),
                        ),
                      ),
                    );
                  }),
                  const SizedBox(width: 6),
                  // Next
                  _PaginationButton(
                    icon: Icons.chevron_right_rounded,
                    enabled: safePage < totalPages - 1,
                    isLight: isLight,
                    onTap: () => setState(() => _currentPage = safePage + 1),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// Reusable pagination arrow button
class _PaginationButton extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final bool isLight;
  final VoidCallback onTap;
  const _PaginationButton({
    required this.icon,
    required this.enabled,
    required this.isLight,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: enabled
              ? (isLight ? const Color(0xFFEEF2F6) : Colors.white.withOpacity(0.08))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: enabled
                ? (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.1))
                : Colors.transparent,
          ),
        ),
        child: Icon(
          icon,
          size: 18,
          color: enabled
              ? (isLight ? const Color(0xFF1E293B) : Colors.white70)
              : (isLight ? Colors.black26 : Colors.white24),
        ),
      ),
    );
  }
}

class BlogDetailScreen extends StatefulWidget {
  final String postId;
  const BlogDetailScreen({super.key, required this.postId});

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _commentController = TextEditingController();
  final GlobalKey _commentsKey = GlobalKey();
  int _commentPage = 0;
  static const int _commentsPerPage = 5;

  @override
  void dispose() {
    _scrollController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  void _scrollToComments() {
    final context = _commentsKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    }
  }

  void _showShareSheet(BuildContext context, Map<String, dynamic> post) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    showModalBottomSheet(
      context: context,
      backgroundColor: isLight ? Colors.white : const Color(0xFF1E1B4B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
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
                'Share Revelation',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isLight ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildShareOption(
                    icon: Icons.link_rounded,
                    label: 'Copy Link',
                    isLight: isLight,
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: 'https://foi-academy.org/blog/${post['id']}'));
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Link copied to clipboard!')),
                      );
                    },
                  ),
                  _buildShareOption(
                    icon: Icons.chat_rounded,
                    label: 'WhatsApp',
                    isLight: isLight,
                    onTap: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Redirecting to WhatsApp...')),
                      );
                    },
                  ),
                  _buildShareOption(
                    icon: Icons.email_rounded,
                    label: 'Email',
                    isLight: isLight,
                    onTap: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening Mail application...')),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildShareOption({
    required IconData icon,
    required String label,
    required bool isLight,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 80,
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isLight ? const Color(0xFFEEF2F6) : Colors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: const Color(0xFFFBBF24)),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isLight ? Colors.black87 : Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper method to parse markdown style content headers/lists/blocks
  List<Widget> _parseContent(String text, bool isLight) {
    final List<Widget> widgets = [];
    final lines = text.split('\n');

    for (int i = 0; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) {
        widgets.add(const SizedBox(height: 12));
        continue;
      }

      if (line.startsWith('###')) {
        // H3 Heading
        widgets.add(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            child: Text(
              line.replaceFirst('###', '').trim(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.3,
                color: isLight ? const Color(0xFF1E293B) : Colors.white,
              ),
            ),
          ),
        );
      } else if (line.startsWith('1.') || line.startsWith('*') || line.startsWith('-')) {
        // List Item
        final cleanText = line.replaceFirst(RegExp(r'(^\d\.\s*|^\*\s*|^-\s*)'), '').trim();
        widgets.add(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  line.startsWith('1.') ? '${line[0]}. ' : '• ',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFBBF24),
                    fontSize: 16,
                  ),
                ),
                Expanded(
                  child: Text(
                    cleanText,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: isLight ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        // Regular Paragraph
        widgets.add(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6.0),
            child: Text(
              line,
              style: TextStyle(
                fontSize: 16,
                height: 1.7,
                color: isLight ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
              ),
            ),
          ),
        );
      }
    }
    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);
    final isLight = Theme.of(context).brightness == Brightness.light;

    // Find the post
    final postIndex = api.blogPosts.indexWhere((p) => p['id'] == widget.postId);
    if (postIndex == -1) {
      return const Scaffold(
        body: Center(
          child: Text('Post not found'),
        ),
      );
    }
    final post = api.blogPosts[postIndex];
    final liked = post['likedByUser'] ?? false;
    final likesCount = post['likes'] ?? 0;
    final commentsList = post['comments'] as List? ?? [];
    final totalCommentPages = (commentsList.length / _commentsPerPage).ceil().clamp(1, 999);
    final safeCommentPage = _commentPage.clamp(0, totalCommentPages - 1);
    final commentStart = safeCommentPage * _commentsPerPage;
    final commentEnd = (commentStart + _commentsPerPage).clamp(0, commentsList.length);
    final pagedComments = commentsList.sublist(commentStart, commentEnd);

    return Scaffold(
      backgroundColor: isLight ? Colors.white : const Color(0xFF0F172A),
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                backgroundColor: isLight ? Colors.white : const Color(0xFF1E1B4B),
                iconTheme: IconThemeData(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                leading: IconButton(
                  icon: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.35),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        post['thumbnail'],
                        fit: BoxFit.cover,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withOpacity(0.5),
                              Colors.transparent,
                              Colors.black.withOpacity(0.7),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 100), // Bottom padding for floating bar
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category & views
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              post['category'].toString().toUpperCase(),
                              style: const TextStyle(
                                color: Color(0xFFFBBF24),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Row(
                            children: [
                              Icon(Icons.remove_red_eye_outlined, size: 14, color: isLight ? Colors.black45 : Colors.white54),
                              const SizedBox(width: 4),
                              Text(
                                '${post['views'] ?? 0} views',
                                style: TextStyle(
                                  color: isLight ? Colors.black45 : Colors.white54,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Title
                      Text(
                        post['title'],
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                          color: isLight ? const Color(0xFF1E293B) : Colors.white,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Subtitle
                      Text(
                        post['subtitle'],
                        style: TextStyle(
                          fontSize: 15,
                          fontStyle: FontStyle.italic,
                          color: isLight ? Colors.black54 : Colors.white60,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Author Info Card
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E1B4B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.05)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: const Color(0xFF6366F1),
                              foregroundColor: Colors.white,
                              child: Text(post['author'][0].toString().toUpperCase()),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  post['author'],
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                  ),
                                ),
                                Text(
                                  'Watchman & Teacher',
                                  style: TextStyle(
                                    color: isLight ? Colors.black45 : Colors.white54,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            Text(
                              post['date'],
                              style: TextStyle(
                                color: isLight ? Colors.black38 : Colors.white38,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Article Content Body
                      ..._parseContent(post['content'], isLight),
                      const SizedBox(height: 32),
                      const Divider(height: 1),
                      const SizedBox(height: 24),

                      // Discussion / Comments Header
                      Row(
                        key: _commentsKey,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Discussion (${commentsList.length})',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isLight ? const Color(0xFF1E293B) : Colors.white,
                            ),
                          ),
                          Text(
                            'Share your testimony',
                            style: TextStyle(
                              fontSize: 12,
                              color: isLight ? Colors.black38 : Colors.white38,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Comments List
                      if (commentsList.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Center(
                            child: Text(
                              'Be the first to share a thought on this word.',
                              style: TextStyle(
                                color: isLight ? Colors.black38 : Colors.white38,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        )
                      else
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              padding: EdgeInsets.zero,
                              itemCount: pagedComments.length,
                              itemBuilder: (context, idx) {
                                final comment = pagedComments[idx];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E1B4B),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.04),
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      CircleAvatar(
                                        radius: 16,
                                        backgroundColor: const Color(0xFF10B981),
                                        foregroundColor: Colors.white,
                                        child: Text(
                                          comment['author'] != null && comment['author'].isNotEmpty
                                              ? comment['author'][0].toString().toUpperCase()
                                              : 'G',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  comment['author'] ?? 'Guest Partner',
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 13,
                                                    color: isLight ? const Color(0xFF1E293B) : Colors.white,
                                                  ),
                                                ),
                                                Text(
                                                  comment['date'] ?? '',
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    color: isLight ? Colors.black38 : Colors.white38,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              comment['comment'] ?? '',
                                              style: TextStyle(
                                                fontSize: 13,
                                                height: 1.4,
                                                color: isLight ? Colors.black87 : Colors.white70,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                            // Comment pagination controls
                            if (commentsList.length > _commentsPerPage)
                              Padding(
                                padding: const EdgeInsets.only(top: 4, bottom: 8),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    _PaginationButton(
                                      icon: Icons.chevron_left_rounded,
                                      enabled: safeCommentPage > 0,
                                      isLight: isLight,
                                      onTap: () => setState(() => _commentPage = safeCommentPage - 1),
                                    ),
                                    const SizedBox(width: 6),
                                    ...List.generate(totalCommentPages, (i) {
                                      final isActive = i == safeCommentPage;
                                      return GestureDetector(
                                        onTap: () => setState(() => _commentPage = i),
                                        child: AnimatedContainer(
                                          duration: const Duration(milliseconds: 200),
                                          margin: const EdgeInsets.symmetric(horizontal: 3),
                                          width: isActive ? 30 : 26,
                                          height: 26,
                                          decoration: BoxDecoration(
                                            color: isActive
                                                ? const Color(0xFFFBBF24)
                                                : (isLight ? const Color(0xFFEEF2F6) : Colors.white.withOpacity(0.07)),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          alignment: Alignment.center,
                                          child: Text(
                                            '${i + 1}',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: isActive
                                                  ? const Color(0xFF0F172A)
                                                  : (isLight ? Colors.black54 : Colors.white54),
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                    const SizedBox(width: 6),
                                    _PaginationButton(
                                      icon: Icons.chevron_right_rounded,
                                      enabled: safeCommentPage < totalCommentPages - 1,
                                      isLight: isLight,
                                      onTap: () => setState(() => _commentPage = safeCommentPage + 1),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      const SizedBox(height: 24),

                      // Add Comment Input Box
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _commentController,
                              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                hintText: 'Add to the discussion...',
                                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 14),
                                filled: true,
                                fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.05),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: () {
                              final text = _commentController.text.trim();
                              if (text.isNotEmpty) {
                                final author = api.currentUser?['name'] ?? 'Guest Partner';
                                api.addCommentToPost(post['id'], author, text);
                                _commentController.clear();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Comment posted successfully!')),
                                );
                              }
                            },
                            icon: const Icon(Icons.send_rounded, color: Color(0xFFFBBF24)),
                            style: IconButton.styleFrom(
                              backgroundColor: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF1E1B4B),
                              padding: const EdgeInsets.all(12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Floating Rebranded Action Control Bar at Bottom
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: Container(
              height: 64,
              decoration: BoxDecoration(
                color: isLight ? Colors.white : const Color(0xFF1E1B4B),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(
                  color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isLight ? 0.08 : 0.25),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  // Like Action
                  _buildActionBarItem(
                    icon: liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                    label: '$likesCount',
                    color: liked ? Colors.red : (isLight ? const Color(0xFF64748B) : Colors.white70),
                    onTap: () {
                      api.toggleLikePost(post['id']);
                    },
                  ),
                  // Comment Shortcut Scroll
                  _buildActionBarItem(
                    icon: Icons.chat_bubble_outline_rounded,
                    label: '${commentsList.length}',
                    color: isLight ? const Color(0xFF64748B) : Colors.white70,
                    onTap: _scrollToComments,
                  ),
                  // Share Action
                  _buildActionBarItem(
                    icon: Icons.share_outlined,
                    label: 'Share',
                    color: isLight ? const Color(0xFF64748B) : Colors.white70,
                    onTap: () {
                      _showShareSheet(context, post);
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionBarItem({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
