import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class BookReaderScreen extends StatefulWidget {
  final Map<String, dynamic> book;

  const BookReaderScreen({super.key, required this.book});

  @override
  State<BookReaderScreen> createState() => _BookReaderScreenState();
}

class _BookReaderScreenState extends State<BookReaderScreen> {
  int _currentChapterIdx = 0;
  double _fontSize = 18.0;
  String _themeMode = 'light'; // 'light', 'sepia', 'dark'
  late List<dynamic> _chapters;

  @override
  void initState() {
    super.initState();
    // Safely extract chapters list
    final apiService = Provider.of<ApiService>(context, listen: false);
    _chapters = widget.book['chapters'] ?? apiService.getChaptersForBook(widget.book['title'] ?? '');
    if (_chapters.isEmpty) {
      _chapters = [
        {
          'title': 'Introduction',
          'content': 'This book has no chapters loaded yet. Please check back later.'
        }
      ];
    }
  }

  Color _getBackgroundColor() {
    switch (_themeMode) {
      case 'sepia':
        return const Color(0xFFF7F1E3);
      case 'dark':
        return const Color(0xFF0F172A);
      case 'light':
      default:
        return Colors.white;
    }
  }

  Color _getTextColor() {
    switch (_themeMode) {
      case 'sepia':
        return const Color(0xFF5D4037);
      case 'dark':
        return const Color(0xFFF1F5F9);
      case 'light':
      default:
        return const Color(0xFF1E293B);
    }
  }

  Color _getBorderColor() {
    switch (_themeMode) {
      case 'sepia':
        return const Color(0xFFE1D8C1);
      case 'dark':
        return const Color(0xFF334155);
      case 'light':
      default:
        return const Color(0xFFE2E8F0);
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final isDark = _themeMode == 'dark';
            return AlertDialog(
              backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(
                'Display Options',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF1E293B),
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Font Size
                  Text(
                    'Font Size (${_fontSize.toInt()}px)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            if (_fontSize > 12) {
                              setState(() {
                                _fontSize -= 2.0;
                              });
                              setDialogState(() {});
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Icon(Icons.remove, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            if (_fontSize < 30) {
                              setState(() {
                                _fontSize += 2.0;
                              });
                              setDialogState(() {});
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Icon(Icons.add, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Reading Theme
                  Text(
                    'Reading Theme',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildThemeButton('light', 'Light', Colors.white, Colors.black, setDialogState),
                      _buildThemeButton('sepia', 'Sepia', const Color(0xFFF7F1E3), const Color(0xFF5D4037), setDialogState),
                      _buildThemeButton('dark', 'Dark', const Color(0xFF0F172A), Colors.white, setDialogState),
                    ],
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(
                    'Done',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF6366F1),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildThemeButton(String mode, String label, Color bg, Color text, StateSetter setDialogState) {
    final isSelected = _themeMode == mode;
    return GestureDetector(
      onTap: () {
        setState(() {
          _themeMode = mode;
        });
        setDialogState(() {});
      },
      child: Container(
        width: 70,
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: text,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = _getBackgroundColor();
    final textColor = _getTextColor();
    final borderColor = _getBorderColor();
    final currentChapter = _chapters[_currentChapterIdx];
    final title = currentChapter['title'] ?? 'Chapter';
    final content = currentChapter['content'] ?? '';
    final progressPercent = (((_currentChapterIdx + 1) / _chapters.length) * 100).round();

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0.5,
        iconTheme: IconThemeData(color: textColor),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.book['title'] ?? 'E-Book Reader',
              style: TextStyle(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'By ${widget.book['author'] ?? ''}',
              style: TextStyle(
                color: textColor.withOpacity(0.6),
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.format_size),
            onPressed: _showSettingsDialog,
          ),
          Builder(
            builder: (context) {
              return IconButton(
                icon: const Icon(Icons.menu),
                onPressed: () {
                  Scaffold.of(context).openEndDrawer();
                },
              );
            },
          ),
        ],
      ),
      endDrawer: Drawer(
        child: Container(
          color: _themeMode == 'dark' ? const Color(0xFF1E293B) : Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  color: _themeMode == 'dark' ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        widget.book['coverUrl'] ?? '',
                        width: 50,
                        height: 70,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.book, size: 40),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.book['title'] ?? '',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: _themeMode == 'dark' ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'By ${widget.book['author'] ?? ''}',
                            style: TextStyle(
                              fontSize: 11,
                              color: _themeMode == 'dark' ? Colors.white60 : Colors.black54,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Chapters Index',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _themeMode == 'dark' ? Colors.white70 : Colors.black87,
                  ),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: _chapters.length,
                  itemBuilder: (context, idx) {
                    final isActive = idx == _currentChapterIdx;
                    return ListTile(
                      selected: isActive,
                      selectedTileColor: const Color(0xFF6366F1).withOpacity(0.1),
                      title: Text(
                        _chapters[idx]['title'] ?? '',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                          color: isActive
                              ? const Color(0xFF6366F1)
                              : (_themeMode == 'dark' ? Colors.white.withOpacity(0.9) : Colors.black87),
                        ),
                      ),
                      onTap: () {
                        setState(() {
                          _currentChapterIdx = idx;
                        });
                        Navigator.of(context).pop();
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Reading Progress Bar
            LinearProgressIndicator(
              value: (_currentChapterIdx + 1) / _chapters.length,
              backgroundColor: textColor.withOpacity(0.1),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              minHeight: 3,
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Chapter Title
                    Text(
                      title,
                      style: TextStyle(
                        fontFamily: 'Serif',
                        fontSize: _fontSize + 6,
                        fontWeight: FontWeight.w800,
                        color: textColor,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Divider(color: borderColor),
                    const SizedBox(height: 16),
                    // Chapter Content
                    Text(
                      content,
                      style: TextStyle(
                        fontFamily: 'Serif',
                        fontSize: _fontSize,
                        color: textColor,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
            // Bottom Pagination Controls
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: bgColor,
                border: Border(top: BorderSide(color: borderColor, width: 0.5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    color: textColor,
                    onPressed: _currentChapterIdx > 0
                        ? () {
                            setState(() {
                              _currentChapterIdx--;
                            });
                          }
                        : null,
                  ),
                  Text(
                    'Chapter ${_currentChapterIdx + 1} of ${_chapters.length} (${progressPercent}%)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: textColor.withOpacity(0.6),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    color: textColor,
                    onPressed: _currentChapterIdx < _chapters.length - 1
                        ? () {
                            setState(() {
                              _currentChapterIdx++;
                            });
                          }
                        : null,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
