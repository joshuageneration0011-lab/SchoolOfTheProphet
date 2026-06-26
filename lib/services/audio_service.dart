import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:audioplayers/audioplayers.dart';

class AudioService extends ChangeNotifier {
  final AudioPlayer _player = AudioPlayer();

  Map<String, dynamic>? currentSermon;
  bool isPlaying = false;
  Duration position = Duration.zero;
  Duration duration = Duration.zero;

  late final StreamSubscription _durationSub;
  late final StreamSubscription _positionSub;
  late final StreamSubscription _stateSub;
  late final StreamSubscription _completeSub;

  AudioService() {
    _durationSub = _player.onDurationChanged.listen((d) {
      duration = d;
      notifyListeners();
    });
    _positionSub = _player.onPositionChanged.listen((p) {
      position = p;
      notifyListeners();
    });
    _stateSub = _player.onPlayerStateChanged.listen((state) {
      isPlaying = state == PlayerState.playing;
      notifyListeners();
    });
    _completeSub = _player.onPlayerComplete.listen((_) {
      isPlaying = false;
      position = Duration.zero;
      notifyListeners();
    });
  }

  Future<void> playSermon(Map<String, dynamic> sermon) async {
    try {
      if (currentSermon?['id'] == sermon['id']) {
        // Same sermon — toggle play/pause
        if (isPlaying) {
          await _player.pause();
        } else {
          await _player.resume();
        }
      } else {
        // New sermon
        await _player.stop();
        currentSermon = sermon;
        position = Duration.zero;
        duration = Duration.zero;
        notifyListeners();
        await _player.play(UrlSource(sermon['audioUrl']));
      }
    } catch (e) {
      debugPrint('AudioService error: $e');
    }
  }

  Future<void> pause() async {
    await _player.pause();
  }

  Future<void> resume() async {
    await _player.resume();
  }

  Future<void> stop() async {
    await _player.stop();
    currentSermon = null;
    position = Duration.zero;
    duration = Duration.zero;
    notifyListeners();
  }

  Future<void> seek(Duration target) async {
    await _player.seek(target);
  }

  Future<void> skipForward() async {
    final target = Duration(seconds: (position.inSeconds + 15).clamp(0, duration.inSeconds));
    await _player.seek(target);
  }

  Future<void> skipBackward() async {
    final target = Duration(seconds: (position.inSeconds - 15).clamp(0, duration.inSeconds));
    await _player.seek(target);
  }

  String formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _durationSub.cancel();
    _positionSub.cancel();
    _stateSub.cancel();
    _completeSub.cancel();
    _player.dispose();
    super.dispose();
  }
}
