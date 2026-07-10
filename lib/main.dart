import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';
import 'services/audio_service.dart';
import 'services/theme_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ApiService()),
        ChangeNotifierProvider(create: (_) => AudioService()),
        ChangeNotifierProvider(create: (_) => ThemeService()),
      ],
      child: const SopAcademyApp(),
    ),
  );
}

class SopAcademyApp extends StatelessWidget {
  const SopAcademyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeService = Provider.of<ThemeService>(context);
    return MaterialApp(
      title: 'SOP Academy',
      debugShowCheckedModeBanner: false,
      themeMode: themeService.mode,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFFAFAF9),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFFF59E0B),
          background: const Color(0xFFFAFAF9),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
        cardTheme: CardThemeData(
          color: Colors.white,
          surfaceTintColor: Colors.transparent,
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          fillColor: Colors.black.withOpacity(0.04),
          filled: true,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: const Color(0xFF818CF8),
          primary: const Color(0xFF818CF8),
          secondary: const Color(0xFFFBBF24),
          surface: const Color(0xFF0F172A),
          onSurface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFF030712),
        canvasColor: const Color(0xFF030712),
        cardColor: const Color(0xFF0F172A),
        dialogBackgroundColor: const Color(0xFF0F172A),
        bottomSheetTheme: const BottomSheetThemeData(
          backgroundColor: Color(0xFF0B0F19),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF0F172A),
          surfaceTintColor: Colors.transparent,
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          fillColor: const Color(0xFF0F172A),
          filled: true,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: const Color(0xFF0F172A),
          indicatorColor: const Color(0xFF818CF8).withOpacity(0.2),
        ),
      ),
      home: const HomeScreen(),
      routes: {
        '/onboarding': (context) => const OnboardingScreen(),
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
      },
    );
  }
}
