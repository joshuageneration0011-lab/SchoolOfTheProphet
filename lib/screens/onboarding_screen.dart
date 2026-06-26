import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<Map<String, String>> _slides = [
    {
      'title': 'School of the Prophets',
      'subtitle': 'Equipping believers in prophetic ministry, prayer, and apostolic leadership across the nations.',
      'image': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=800&fit=crop',
    },
    {
      'title': 'Anointed Curriculum',
      'subtitle': 'Learn from seasoned prophets and teachers. Grow in hearing God\'s voice and operating in spiritual gifts.',
      'image': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=800&fit=crop',
    },
    {
      'title': 'Spirit-Led Community',
      'subtitle': 'Engage in mentorship circles, track your assignments, and connect with other spiritual watchmen.',
      'image': 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=800&fit=crop',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isLight
                    ? [Colors.white, const Color(0xFFF1F5F9)]
                    : [const Color(0xFF1E1B4B), const Color(0xFF0F172A)],
              ),
            ),
          ),
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemCount: _slides.length,
            itemBuilder: (context, index) {
              final slide = _slides[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 60.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Slide Image with Glass Border Mock
                    Container(
                      height: 280,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: isLight ? Colors.black.withOpacity(0.06) : Colors.purple.withOpacity(0.2),
                            blurRadius: 20,
                            spreadRadius: 5,
                          )
                        ],
                        image: DecorationImage(
                          image: NetworkImage(slide['image']!),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    Text(
                      slide['title']!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: isLight ? const Color(0xFF1E293B) : Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      slide['subtitle']!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: isLight ? const Color(0xFF64748B) : Colors.indigo[100],
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          // Navigation controls
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Indicators
                Row(
                  children: List.generate(
                    _slides.length,
                    (index) => Container(
                      margin: const EdgeInsets.only(right: 8),
                      height: 8,
                      width: _currentIndex == index ? 24 : 8,
                      decoration: BoxDecoration(
                        color: _currentIndex == index
                            ? const Color(0xFFFBBF24)
                            : (isLight ? Colors.black12 : Colors.white24),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                // Button
                ElevatedButton(
                  onPressed: () {
                    if (_currentIndex == _slides.length - 1) {
                      Navigator.pushReplacementNamed(context, '/login');
                    } else {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFBBF24), // Amber
                    foregroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    _currentIndex == _slides.length - 1 ? 'Get Started' : 'Next',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
