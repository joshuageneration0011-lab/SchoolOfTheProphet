import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isSignUp = false;
  String _errorMessage = '';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final apiService = Provider.of<ApiService>(context);
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
                    ? [const Color(0xFFFAFAF9), const Color(0xFFF5F5F4)]
                    : [const Color(0xFF02040A), const Color(0xFF090714), const Color(0xFF0B0F19)],
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Logo or Anointed Icon
                      Center(
                        child: Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFFC084FC), Color(0xFFFBBF24)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6366F1).withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.menu_book,
                            size: 40,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isSignUp ? 'Create Account' : 'Welcome Back',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: isLight ? const Color(0xFF0F172A) : Colors.white,
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _isSignUp
                            ? 'Register to start your prophetic journey'
                            : 'Access your prophetic e-learning portal',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          color: isLight ? const Color(0xFF64748B) : Colors.indigo[100],
                        ),
                      ),
                      const SizedBox(height: 36),

                      // Rebranded Form Container Card
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: isLight ? Colors.white : const Color(0xFF0F172A).withOpacity(0.5),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(
                            color: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.06),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isLight ? Colors.black.withOpacity(0.02) : Colors.black.withOpacity(0.4),
                              blurRadius: 24,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Full Name Field (Sign Up Mode Only)
                            if (_isSignUp) ...[
                              TextFormField(
                                controller: _nameController,
                                style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                                decoration: InputDecoration(
                                  hintText: 'John Doe',
                                  hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                                  labelText: 'Full Name',
                                  labelStyle: TextStyle(color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                  prefixIcon: Icon(Icons.person_outline, color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                  filled: true,
                                  fillColor: isLight ? Colors.black.withOpacity(0.03) : const Color(0xFF030712).withOpacity(0.6),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: BorderSide.none,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your name';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Email Field
                            TextFormField(
                              controller: _emailController,
                              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                              decoration: InputDecoration(
                                hintText: 'student@sop.org',
                                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                                labelText: 'Email Address',
                                labelStyle: TextStyle(color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                prefixIcon: Icon(Icons.email_outlined, color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                filled: true,
                                fillColor: isLight ? Colors.black.withOpacity(0.03) : const Color(0xFF030712).withOpacity(0.6),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your email';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),

                            // Password Field
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                              decoration: InputDecoration(
                                hintText: 'student123',
                                hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                                labelText: 'Password',
                                labelStyle: TextStyle(color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                prefixIcon: Icon(Icons.lock_outline, color: isLight ? const Color(0xFF64748B) : Colors.white70),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                    color: isLight ? const Color(0xFF64748B) : Colors.white70,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                                filled: true,
                                fillColor: isLight ? Colors.black.withOpacity(0.03) : const Color(0xFF030712).withOpacity(0.6),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your password';
                                }
                                return null;
                              },
                            ),

                            if (_errorMessage.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              Text(
                                _errorMessage,
                                style: const TextStyle(color: Colors.redAccent, fontSize: 14),
                                textAlign: TextAlign.center,
                              ),
                            ],

                            const SizedBox(height: 30),

                            // Submit Button
                            ElevatedButton(
                              onPressed: apiService.isLoading
                                  ? null
                                  : () async {
                                      if (_formKey.currentState!.validate()) {
                                        setState(() {
                                          _errorMessage = '';
                                        });
                                        if (_isSignUp) {
                                          final error = await apiService.signup(
                                            _nameController.text.trim(),
                                            _emailController.text.trim(),
                                            _passwordController.text,
                                          );
                                          if (error == null && mounted) {
                                            if (Navigator.canPop(context)) {
                                              Navigator.pop(context, true);
                                            } else {
                                              Navigator.pushReplacementNamed(context, '/home');
                                            }
                                          } else {
                                            setState(() {
                                              _errorMessage = error ?? 'Sign up failed. Please try again.';
                                            });
                                          }
                                        } else {
                                          final success = await apiService.login(
                                            _emailController.text.trim(),
                                            _passwordController.text,
                                          );
                                          if (success && mounted) {
                                            if (Navigator.canPop(context)) {
                                              Navigator.pop(context, true);
                                            } else {
                                              Navigator.pushReplacementNamed(context, '/home');
                                            }
                                          } else {
                                            setState(() {
                                              _errorMessage = 'Invalid email or password. Please try again.';
                                            });
                                          }
                                        }
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6366F1),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 18),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 0,
                              ),
                              child: apiService.isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : Text(
                                      _isSignUp ? 'Create Account' : 'Login to Portal',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                            ),
                            const SizedBox(height: 20),
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _isSignUp = !_isSignUp;
                                  _errorMessage = '';
                                });
                              },
                              child: Text(
                                _isSignUp
                                    ? 'Already have an account? Login'
                                    : "Don't have an account? Register",
                                style: const TextStyle(
                                  color: Color(0xFF6366F1),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
