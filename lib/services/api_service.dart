import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class ApiService extends ChangeNotifier {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5001/api';
    } else {
      // Use 10.0.2.2 for Android emulator to access development server host loopback
      return 'http://10.0.2.2:5001/api';
    }
  }

  Map<String, dynamic>? _currentUser;
  List<dynamic> _courses = [];
  List<dynamic> _books = [];
  List<dynamic> _messages = [];
  List<dynamic> _blogPosts = [];
  bool _isLoading = false;

  Map<String, dynamic>? get currentUser => _currentUser;
  List<dynamic> get courses => _courses;
  List<dynamic> get books => _books;
  List<dynamic> get messages => _messages;
  List<dynamic> get blogPosts => _blogPosts;
  bool get isLoading => _isLoading;

  ApiService() {
    _loadUserSession();
    fetchBlogPosts();
    fetchBooks();
  }

  Future<void> _loadUserSession() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user_session');
    if (userString != null) {
      _currentUser = json.decode(userString);
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        _currentUser = json.decode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_session', json.encode(_currentUser));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      // Offline fallback for demo / developer mode
      if (email == 'student@sop.org' && password == 'student123') {
        _currentUser = {
          'id': 'demo_student_id',
          'name': 'Demo Student',
          'email': 'student@sop.org',
          'role': 'student',
          'enrolledCourses': ['1', '2'],
          'completedCourses': []
        };
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_session', json.encode(_currentUser));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<String?> signup(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'name': name, 'email': email, 'password': password}),
      );

      if (response.statusCode == 201) {
        _currentUser = json.decode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_session', json.encode(_currentUser));
        _isLoading = false;
        notifyListeners();
        return null;
      } else {
        final body = json.decode(response.body);
        _isLoading = false;
        notifyListeners();
        return body['error'] ?? 'Sign up failed. Please try again.';
      }
    } catch (e) {
      _currentUser = {
        'id': 'demo_student_${DateTime.now().millisecondsSinceEpoch}',
        'name': name,
        'email': email,
        'role': 'student',
        'enrolledCourses': [],
        'completedCourses': []
      };
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_session', json.encode(_currentUser));
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> enrollInCourse(String courseId) async {
    if (_currentUser == null) return false;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/courses/enroll'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': _currentUser!['id'],
          'courseId': courseId,
        }),
      );
      if (response.statusCode == 200) {
        final updatedUser = json.decode(response.body);
        _currentUser = updatedUser;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_session', json.encode(_currentUser));
        notifyListeners();
        return true;
      }
    } catch (e) {
      // Offline fallback
    }

    final enrolled = List<String>.from(_currentUser!['enrolledCourses'] ?? []);
    if (!enrolled.contains(courseId)) {
      enrolled.add(courseId);
      final updatedUser = Map<String, dynamic>.from(_currentUser!);
      updatedUser['enrolledCourses'] = enrolled;
      _currentUser = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_session', json.encode(_currentUser));
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_session');
    notifyListeners();
  }

  Future<void> fetchCourses() async {
    // Load fallback courses FIRST so the UI is never empty
    _loadFallbackCourses();
    notifyListeners();

    // Then try the live API to override with real data
    try {
      final url = '$baseUrl/courses';
      debugPrint('COURSES API: Sending GET request to $url');
      final response = await http.get(Uri.parse(url));
      debugPrint('COURSES API: Received response with status code: ${response.statusCode}');
      if (response.statusCode == 200) {
        final List<dynamic> rawCourses = json.decode(response.body);
        debugPrint('COURSES API: Decoded ${rawCourses.length} courses');
        if (rawCourses.isNotEmpty) {
          _courses = rawCourses;
          debugPrint('COURSES API: Updated _courses list, notifying listeners...');
          notifyListeners();
        }
      } else {
        debugPrint('COURSES API: Failed with status ${response.statusCode}');
      }
    } catch (e, stack) {
      debugPrint('COURSES API: Error: $e');
      debugPrint('COURSES API: StackTrace: $stack');
    }
  }

  void _loadFallbackCourses() {
    _courses = [
      {
        'id': '1',
        'title': 'Foundations of Prophetic Ministry',
        'instructor': 'Prophet Elijah Mensah',
        'price': 29999,
        'rating': 4.9,
        'thumbnail': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop',
        'category': 'Prophetic',
        'duration': '24 hours',
        'lessons': 5,
        'level': 'Beginner',
        'description': "Learn the biblical foundations of the prophetic office, hearing God's voice, and operating in the gift of prophecy.",
        'whatYouLearn': ["Hearing God's voice clearly", "Understanding prophetic gifts", "Delivering prophetic words"],
        'requirements': ["A Bible", "Sincere desire to grow"],
        'videos': [
          {'title': 'Lesson 1: The Calling of the Prophet', 'duration': '15 min', 'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ'},
          {'title': 'Lesson 2: Protocol of the Spirit', 'duration': '20 min', 'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
        ]
      },
      {
        'id': '2',
        'title': 'The School of Intercessory Prayer',
        'instructor': 'Prophetess Grace Adeyemi',
        'price': 19999,
        'rating': 4.8,
        'thumbnail': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
        'category': 'Prayer',
        'duration': '18 hours',
        'lessons': 3,
        'level': 'Intermediate',
        'description': 'Master the art of intercessory prayer, travailing in the Spirit, and standing in the gap for nations.',
        'whatYouLearn': ["Principles of intercession", "Travailing prayer", "Spiritual warfare"],
        'requirements': ["Basic understanding of prayer"],
        'videos': [
          {'title': 'Lesson 1: Understanding Intercession', 'duration': '22 min', 'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
        ]
      }
    ];
  }

  // ── E-Books: Sync from webapp backend, with fallback mock data ───────────────
  // Books can have selarUrl (buy on Selar.co) and/or amazonUrl (buy on Amazon).
  // The UI will show contextual "Buy on Selar" / "Buy on Amazon" / "Download PDF" 
  // buttons depending on which fields are present on each book.
  // Helper to get static chapters for Joshua Generation books
  List<Map<String, String>> getChaptersForBook(String title) {
    switch (title) {
      case 'Purpose & Destiny':
        return [
          {
            'title': 'Chapter 1: The Sovereign Plan',
            'content': 'Before you were formed in the womb, God knew you and set you apart. Your life is not an accident or a product of chance. There is a divine blueprint written in heaven specifically for you. The sovereign plan of God is the foundation of all true purpose. When you align with His will, your path becomes clear, and your steps are ordered by His grace. Step forward in the confidence that He who began a good work in you will carry it on to completion.'
          },
          {
            'title': 'Chapter 2: Uncovering Your Divine Gifts',
            'content': 'Every individual has been uniquely equipped by God with talents, spiritual gifts, and capabilities designed to serve the Kingdom. Understanding your gifts is a vital step toward fulfilling your destiny. Take time to pray, self-reflect, and seek counsel to recognize what comes naturally to you and where God\'s power amplifies your efforts. Use your gifts to lift others, build the church, and display His glory.'
          },
          {
            'title': 'Chapter 3: Standing Firm in Trials',
            'content': 'A strong destiny is forged in the fire of testing. Trials are not meant to destroy you; they are designed to refine you. Keep your eyes fixed on Jesus, the author and finisher of our faith. When storms arise, hold fast to His promises and remember that the trials of today are preparing you for the victories of tomorrow.'
          }
        ];
      case 'The Prayer Warrior':
        return [
          {
            'title': 'Chapter 1: The Language of Heaven',
            'content': 'Prayer is not a religious duty; it is a relationship. It is the language of communication between heaven and earth. To pray effectively is to communicate from the heart of a child to the ears of a loving Father. When you enter your secret closet and close the door, you enter a realm of limitless power and deep communion.'
          },
          {
            'title': 'Chapter 2: Persistent Faith',
            'content': 'Persistence in prayer is the key to breakthroughs. Do not grow weary in asking, seeking, and knocking. The answers are on the way. Continue to stand in faith, declaring the scriptures, and praise God even before you see the physical manifestation of your prayers.'
          }
        ];
      case 'Kingdom Economics':
        return [
          {
            'title': 'Chapter 1: The Principle of Ownership',
            'content': 'Everything belongs to God. Once we realize we are not owners but stewards, our relationship with wealth changes. Wealth is a tool to advance the kingdom and bless others, not a treasure to hoard.'
          },
          {
            'title': 'Chapter 2: The Sowing and Reaping Cycle',
            'content': 'Generosity is the currency of the kingdom. As you sow seed, God multiplies your harvest. Give cheerfully and trust that He will provide all your needs according to His riches in glory.'
          }
        ];
      case 'Walking in the Spirit':
        return [
          {
            'title': 'Chapter 1: Cultivating Sensitivity',
            'content': 'The Holy Spirit speaks in a still, small voice. To hear Him, we must quiet the noise of the world. Set aside time each morning to listen and surrender your day to His guidance.'
          },
          {
            'title': 'Chapter 2: Fruits of the Spirit',
            'content': 'A spirit-led life is evidenced by the character of Christ. Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control should flow naturally from a heart rooted in Him.'
          }
        ];
      case 'Healing for the Broken':
        return [
          {
            'title': 'Chapter 1: Binding Up the Wounds',
            'content': 'God is close to the brokenhearted and saves those who are crushed in spirit. Bring your pain to the altar. Jesus took our stripes, and by His wounds, we are healed, both physically and emotionally.'
          },
          {
            'title': 'Chapter 2: The Freedom of Forgiveness',
            'content': 'Unforgiveness is a prison that blocks your healing. Release the offenses and trust God to vindicate you. When you forgive, you release yourself from the burden of the past.'
          }
        ];
      case 'The Family Altar':
        return [
          {
            'title': 'Chapter 1: The Devoted Home',
            'content': 'A home built on prayer stands strong. Establish a daily family altar where you worship, read the word, and pray together. It seals the hearts of your children and invites God\'s peace into your household.'
          },
          {
            'title': 'Chapter 2: Legacy of Faith',
            'content': 'What you model in the home will outlive you. Pass down a legacy of scripture reading, integrity, and faith that will guide generations to come.'
          }
        ];
      default:
        return [
          {
            'title': 'Introduction',
            'content': 'This book has no chapters loaded yet. Please check back later.'
          }
        ];
    }
  }

  Future<void> fetchBooks() async {
    // Load fallback books FIRST so the UI is never empty
    _loadFallbackBooks();
    notifyListeners();

    // Then try the live API to override with real data
    try {
      final url = '$baseUrl/books';
      debugPrint('BOOKS API: Sending GET request to $url');
      final response = await http.get(Uri.parse(url));
      debugPrint('BOOKS API: Received response with status code: ${response.statusCode}');
      if (response.statusCode == 200) {
        final List<dynamic> rawBooks = json.decode(response.body);
        debugPrint('BOOKS API: Decoded ${rawBooks.length} books');
        if (rawBooks.isNotEmpty) {
          _books = rawBooks.map((b) {
            final Map<String, dynamic> bookMap = Map<String, dynamic>.from(b);
            if (bookMap['chapters'] == null) {
              bookMap['chapters'] = getChaptersForBook(bookMap['title'] ?? '');
            }
            return bookMap;
          }).toList();
          debugPrint('BOOKS API: Updated _books list, notifying listeners...');
          notifyListeners();
        }
      } else {
        debugPrint('BOOKS API: Failed with status ${response.statusCode}');
      }
    } catch (e, stack) {
      debugPrint('BOOKS API: Error: $e');
      debugPrint('BOOKS API: StackTrace: $stack');
    }
  }

  void _loadFallbackBooks() {
    _books = [
      {
        'id': 'b-mock-1',
        'title': 'Purpose & Destiny',
        'author': 'Pastor John Michael',
        'coverUrl': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        'description': 'Discover God\'s unique purpose for your life and walk boldly in your destiny.',
        'category': 'Purpose',
        'pdfUrl': 'http://localhost:5001/books/purpose_and_destiny.pdf',
        'selarUrl': 'https://selar.co/purposedestiny',
        'amazonUrl': 'https://amazon.com/dp/purpose-destiny',
        'price': 1500.0,
        'pages': 120,
        'downloads': 1530,
        'rating': 4.9,
        'chapters': getChaptersForBook('Purpose & Destiny')
      },
      {
        'id': 'b-mock-2',
        'title': 'The Prayer Warrior',
        'author': 'Sarah Williams',
        'coverUrl': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
        'description': 'A comprehensive guide to developing a powerful and effective prayer life.',
        'category': 'Prayer',
        'pdfUrl': 'http://localhost:5001/books/prayer_warrior.pdf',
        'selarUrl': 'https://selar.co/prayerwarrior',
        'amazonUrl': 'https://amazon.com/dp/prayer-warrior',
        'price': 1000.0,
        'pages': 150,
        'downloads': 2100,
        'rating': 4.8,
        'chapters': getChaptersForBook('The Prayer Warrior')
      },
      {
        'id': 'b-mock-3',
        'title': 'Kingdom Economics',
        'author': 'David Thompson',
        'coverUrl': 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&q=80',
        'description': 'Biblical principles for financial freedom and kingdom stewardship.',
        'category': 'Finance',
        'pdfUrl': 'http://localhost:5001/books/kingdom_economics.pdf',
        'selarUrl': 'https://selar.co/kingdomeconomics',
        'amazonUrl': 'https://amazon.com/dp/kingdom-economics',
        'price': 2000.0,
        'pages': 180,
        'downloads': 980,
        'rating': 4.7,
        'chapters': getChaptersForBook('Kingdom Economics')
      },
      {
        'id': 'b-mock-4',
        'title': 'Walking in the Spirit',
        'author': 'Rachel Grace',
        'coverUrl': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
        'description': 'Learn to live a Spirit-led life in every area of your daily walk.',
        'category': 'Spiritual Growth',
        'pdfUrl': 'http://localhost:5001/books/walking_in_the_spirit.pdf',
        'selarUrl': 'https://selar.co/walkingspirit',
        'amazonUrl': 'https://amazon.com/dp/walking-spirit',
        'price': 1200.0,
        'pages': 140,
        'downloads': 1420,
        'rating': 4.9,
        'chapters': getChaptersForBook('Walking in the Spirit')
      },
      {
        'id': 'b-mock-5',
        'title': 'Healing for the Broken',
        'author': 'Pastor John Michael',
        'coverUrl': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        'description': 'Find emotional and spiritual healing through God\'s restoring power.',
        'category': 'Healing',
        'pdfUrl': 'http://localhost:5001/books/healing_broken.pdf',
        'selarUrl': 'https://selar.co/healingbroken',
        'amazonUrl': 'https://amazon.com/dp/healing-broken',
        'price': 1800.0,
        'pages': 165,
        'downloads': 1150,
        'rating': 4.8,
        'chapters': getChaptersForBook('Healing for the Broken')
      },
      {
        'id': 'b-mock-6',
        'title': 'The Family Altar',
        'author': 'Minister Rachel Grace',
        'coverUrl': 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&q=80',
        'description': 'Building a strong spiritual foundation for your family through daily devotion.',
        'category': 'Family',
        'pdfUrl': 'http://localhost:5001/books/family_altar.pdf',
        'selarUrl': 'https://selar.co/familyaltar',
        'amazonUrl': 'https://amazon.com/dp/family-altar',
        'price': 1600.0,
        'pages': 200,
        'downloads': 750,
        'rating': 4.9,
        'chapters': getChaptersForBook('The Family Altar')
      }
    ];
  }

  Future<void> fetchMessages() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/mentorship/messages'));
      if (response.statusCode == 200) {
        _messages = json.decode(response.body);
        notifyListeners();
      }
    } catch (e) {
      _messages = [
        {
          'from': 'Sister Chidinma Okafor',
          'to': 'Prophet Elijah Mensah',
          'group': 'Eagles of Prophecy',
          'message': 'Good evening Prophet. I had a vivid dream last night about golden scrolls.',
          'date': 'June 12, 2026'
        }
      ];
      notifyListeners();
    }
  }

  Future<bool> sendMessage(String text, String group) async {
    if (_currentUser == null) return false;
    final payload = {
      'from': _currentUser!['name'],
      'to': 'Prophet Elijah Mensah',
      'group': group,
      'message': text,
    };

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/mentorship/messages'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      if (response.statusCode == 201) {
        final newMsg = json.decode(response.body);
        _messages.insert(0, newMsg);
        notifyListeners();
        return true;
      }
    } catch (e) {
      // Local addition for instant feedback
      _messages.insert(0, {
        'from': _currentUser!['name'],
        'to': 'Prophet Elijah Mensah',
        'group': group,
        'message': text,
        'date': 'Just now'
      });
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> fetchBlogPosts() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/blog'));
      if (response.statusCode == 200) {
        _blogPosts = json.decode(response.body);
        notifyListeners();
        return;
      }
    } catch (e) {
      // Offline fallback
    }

    _blogPosts = [
      {
        'id': 'b1',
        'title': 'The Sound of Abundance: Discerning the Rain of His Presence',
        'subtitle': 'Positioning yourself to hear and receive what the Spirit is releasing in this hour.',
        'author': 'Prophet Elijah Mensah',
        'date': 'June 18, 2026',
        'category': 'Prophecy',
        'readTime': '5 min read',
        'thumbnail': 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&fit=crop&q=80',
        'likes': 145,
        'views': 1205,
        'likedByUser': false,
        'comments': [
          {'author': 'Sister Ruth', 'comment': 'A truly timely word! God bless you Prophet Elijah.', 'date': '2 hours ago'},
          {'author': 'Brother John', 'comment': 'I received this sound of abundance in my spirit!', 'date': '5 hours ago'}
        ],
        'content': '''The scriptures speak of a moment when the prophet Elijah stood atop Mount Carmel and declared, "I hear the sound of the abundance of rain" (1 Kings 18:41). What makes this declaration remarkable is that at the time of his speaking, there was not a single cloud in the sky. The land had suffered a severe drought for three and a half years. Elijah did not hear the rain with his physical ears; he heard it through the auditory channels of the spirit.

### Discerning Atmospheric Shifts
Before a physical shift occurs in your life, your family, or your ministry, there will always be a spiritual shift in the atmosphere. The ability to discern these shifts is crucial. If you cannot sense the change, you will remain in the posture of drought even when the rain is falling.

To discern what God is doing:
1. **Silence the Noise:** The voice of the culture is loud, but the voice of the Spirit is often a still, small whisper.
2. **Track the Unrest:** When the Holy Spirit is preparing a shift, you will often feel a divine dissatisfaction with your current spiritual plateau.
3. **Align with Prophetic Decrees:** Receive and meditate on the words released by the seasoned watchmen of our generation.

### Positioning for the Rain
Hearing the sound of rain is only the first step. You must also position yourself to receive it. Elijah did not go to celebrate; he went to the top of Carmel, cast himself down upon the earth, and put his face between his knees in deep, travailing intercession.

Get ready. The drought is ending, and the rain of His abundance is about to overflow your life!'''
      },
      {
        'id': 'b2',
        'title': 'Unlocking the Gates of the Morning',
        'subtitle': 'The power of establishing the decrees of God at the dawn of the day.',
        'author': 'Prophetess Grace Adeyemi',
        'date': 'June 15, 2026',
        'category': 'Prayer',
        'readTime': '4 min read',
        'thumbnail': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&fit=crop&q=80',
        'likes': 88,
        'views': 654,
        'likedByUser': false,
        'comments': [
          {'author': 'Pastor Daniel', 'comment': 'Job 38:12 is one of the most powerful morning verses. Thank you for this study.', 'date': '1 day ago'}
        ],
        'content': '''Have you ever wondered why the Lord so often speaks of the morning in scripture? Job 38:12 says, "Hast thou commanded the morning since thy days; and caused the dayspring to know his place?" There is a profound spiritual mystery hidden in the dawn of a new day.

### The Spiritual Significance of the Morning
The morning is a clean canvas. It represents a spiritual gateway where the day's events are conceived and set in motion. The enemy understands this and often seeks to seed anxiety, failure, and strife in the early hours. When you command the morning, you assert your authority as a believer and set the course of the day under the Lordship of Christ.

### How to Command Your Morning
1. **First Fruits of Praise:** Do not touch your phone first. Let your first words be a sacrifice of praise.
2. **Decreeing the Written Word:** Speak scriptural promises aloud. Decree Psalm 91 over your household.
3. **Listen for Instructions:** Spend a few minutes with a notepad. Write down any names, scriptures, or insights.

By dedicating the morning to Him, you build a fortress of peace and authority that shields you from the arrows that fly by day.'''
      },
      {
        'id': 'b3',
        'title': 'Operating in the Gift of Discerning of Spirits',
        'subtitle': 'A guide to understanding spiritual climates and guarding your soul.',
        'author': 'Prophet Elijah Mensah',
        'date': 'June 10, 2026',
        'category': 'Revelation',
        'readTime': '6 min read',
        'thumbnail': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&fit=crop&q=80',
        'likes': 112,
        'views': 918,
        'likedByUser': false,
        'comments': [
          {'author': 'Sister Deborah', 'comment': 'Bitterness is indeed the greatest trap for a discerner. Lord, keep my heart pure.', 'date': '3 days ago'}
        ],
        'content': '''The gift of discerning of spirits is one of the most misunderstood gifts of the Holy Spirit. It is not the "gift of suspicion," nor is it a tool for criticism. It is a supernatural ability given by the Holy Spirit to perceive the source of a spiritual manifestation, whether it is of God, of human origin, or demonic.

### Why Discernment is Vital Today
We live in an age of intense spiritual mixtures. Things that look holy are sometimes driven by alternative motives, and people who seem ordinary are sometimes carrying deep spiritual treasures. Without discernment, you will make decisions based purely on outward appearance.

### The Purpose of the Gift
* **To Protect the Body of Christ:** Recognizing false doctrines or deceptive spirits before they cause harm.
* **To Facilitate Deliverance:** Understanding the specific nature of a demonic binding so it can be cast out.
* **To Verify the Holy Spirit's Work:** Recognizing when God is moving, even if it is in an unconventional way.

### Guarding Your Gift
If you find yourself operating in this gift, guard your heart. The greatest trap for a discerner is bitterness. God shows you what is wrong not so you can judge, but so you can pray and stand in the gap.'''
      }
    ];
    notifyListeners();
  }

  void toggleLikePost(String postId) {
    final idx = _blogPosts.indexWhere((p) => p['id'] == postId);
    if (idx != -1) {
      final post = Map<String, dynamic>.from(_blogPosts[idx]);
      final liked = post['likedByUser'] ?? false;
      post['likedByUser'] = !liked;
      post['likes'] = (post['likes'] ?? 0) + (liked ? -1 : 1);
      _blogPosts[idx] = post;
      notifyListeners();
    }
  }

  void addCommentToPost(String postId, String authorName, String commentText) {
    final idx = _blogPosts.indexWhere((p) => p['id'] == postId);
    if (idx != -1) {
      final post = Map<String, dynamic>.from(_blogPosts[idx]);
      final comments = List<Map<String, dynamic>>.from(post['comments'] ?? []);
      comments.add({
        'author': authorName,
        'comment': commentText,
        'date': 'Just now',
      });
      post['comments'] = comments;
      _blogPosts[idx] = post;
      notifyListeners();
    }
  }
}
