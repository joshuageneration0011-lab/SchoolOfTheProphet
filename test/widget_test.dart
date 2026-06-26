import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:sop_academy_mobile/main.dart';
import 'package:sop_academy_mobile/services/api_service.dart';
import 'package:sop_academy_mobile/services/audio_service.dart';
import 'package:sop_academy_mobile/services/theme_service.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ApiService()),
          ChangeNotifierProvider(create: (_) => AudioService()),
          ChangeNotifierProvider(create: (_) => ThemeService()),
        ],
        child: const SopAcademyApp(),
      ),
    );

    // Verify onboarding elements are present or main app starts.
    expect(find.byType(SopAcademyApp), findsOneWidget);
  });
}
