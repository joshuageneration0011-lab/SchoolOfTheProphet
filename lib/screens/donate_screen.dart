import 'dart:math';
import 'package:flutter/material.dart';

class DonateScreen extends StatefulWidget {
  const DonateScreen({super.key});

  @override
  State<DonateScreen> createState() => _DonateScreenState();
}

class _DonateScreenState extends State<DonateScreen> {
  int _step = 0; // 0: Category, 1: Details, 2: Payment, 3: Success
  String _selectedCause = '';
  String _frequency = 'one-time';
  String _amount = '50';
  final TextEditingController _customAmountController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  // Card details
  final TextEditingController _cardNameController = TextEditingController();
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();
  final TextEditingController _cvvController = TextEditingController();

  final List<String> _presetAmounts = ['10', '25', '50', '100', '250', '500'];
  bool _isProcessing = false;
  String _receiptId = '';

  @override
  void dispose() {
    _customAmountController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _cardNameController.dispose();
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  double _getFinalAmount() {
    if (_amount == 'custom') {
      return double.tryParse(_customAmountController.text) ?? 0.0;
    }
    return double.tryParse(_amount) ?? 0.0;
  }

  void _resetForm() {
    setState(() {
      _step = 0;
      _selectedCause = '';
      _frequency = 'one-time';
      _amount = '50';
      _customAmountController.clear();
      _nameController.clear();
      _emailController.clear();
      _cardNameController.clear();
      _cardNumberController.clear();
      _expiryController.clear();
      _cvvController.clear();
    });
  }

  void _validateAndProceedToPayment() {
    final finalAmount = _getFinalAmount();
    if (finalAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or enter a valid donation amount')),
      );
      return;
    }
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Full name is required')),
      );
      return;
    }
    if (_emailController.text.trim().isEmpty || !_emailController.text.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }
    setState(() {
      _step = 2;
    });
  }

  void _simulatePayment() {
    if (_cardNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cardholder name is required')),
      );
      return;
    }
    if (_cardNumberController.text.replaceAll(' ', '').length < 16) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 16-digit card number')),
      );
      return;
    }
    if (_expiryController.text.length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Expiry date is invalid. Use MM/YY format')),
      );
      return;
    }
    if (_cvvController.text.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('CVC/CVV is invalid')),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    // Simulate API call
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        final randomNum = 100000 + Random().nextInt(900000);
        setState(() {
          _isProcessing = false;
          _receiptId = 'SOP-TXN-$randomNum';
          _step = 3;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Screen Title Header
          if (_step < 3) ...[
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.volunteer_activism_rounded, color: Color(0xFFFBBF24), size: 24),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Partnership & Giving',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
                    ),
                    Text(
                      'Support the spreading of the Gospel',
                      style: TextStyle(fontSize: 12, color: isLight ? Colors.black54 : Colors.white60),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],

          // Stepper Indicator (for Steps 1 & 2)
          if (_step == 1 || _step == 2) ...[
            Row(
              children: [
                _buildStepCircle(1, 'Details', _step >= 1),
                Expanded(child: Container(height: 1, color: isLight ? Colors.black12 : Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 10))),
                _buildStepCircle(2, 'Payment', _step >= 2),
              ],
            ),
            const SizedBox(height: 28),
          ],

          // Render Steps
          if (_step == 0) _buildCategoryStep(),
          if (_step == 1) _buildDetailsStep(),
          if (_step == 2) _buildPaymentStep(),
          if (_step == 3) _buildSuccessStep(),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int stepNum, String title, bool isActive) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final color = isActive ? const Color(0xFFFBBF24) : (isLight ? Colors.black26 : Colors.white24);
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? color.withOpacity(0.15) : Colors.transparent,
            border: Border.all(color: color, width: 2),
          ),
          child: Center(
            child: Text(
              '$stepNum',
              style: TextStyle(color: isActive ? (isLight ? const Color(0xFF1E293B) : Colors.white) : (isLight ? Colors.black38 : Colors.white60), fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(color: isActive ? (isLight ? const Color(0xFF1E293B) : Colors.white) : (isLight ? Colors.black38 : Colors.white60), fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ],
    );
  }

  // Step 0: Category Choice
  Widget _buildCategoryStep() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Choose Your Offering',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Select the category that best reflects your giving intention.',
          style: TextStyle(fontSize: 12, color: isLight ? Colors.black54 : Colors.white54),
        ),
        const SizedBox(height: 20),

        // Prophet Offering Box
        _buildChoiceBox(
          title: 'Prophet Offering',
          description: 'Honor the prophetic ministry and support the anointed work of the prophet in your life.',
          icon: Icons.workspace_premium_rounded,
          accentColor: const Color(0xFFFBBF24),
          gradientColors: isLight
              ? [const Color(0xFFFBBF24).withOpacity(0.12), const Color(0xFFFBBF24).withOpacity(0.02)]
              : [const Color(0xFFFBBF24).withOpacity(0.15), const Color(0xFFFBBF24).withOpacity(0.02)],
          onTap: () {
            setState(() {
              _selectedCause = 'Prophet Offering';
              _step = 1;
            });
          },
        ),
        const SizedBox(height: 20),

        // Mission / Outreach Box
        _buildChoiceBox(
          title: 'Mission / Outreach',
          description: 'Fuel global missions, evangelism campaigns, and community outreach around the world.',
          icon: Icons.language_rounded,
          accentColor: const Color(0xFF4F46E5),
          gradientColors: isLight
              ? [const Color(0xFF4F46E5).withOpacity(0.08), const Color(0xFF4F46E5).withOpacity(0.01)]
              : [const Color(0xFF4F46E5).withOpacity(0.2), const Color(0xFF4F46E5).withOpacity(0.02)],
          onTap: () {
            setState(() {
              _selectedCause = 'Mission/Outreach';
              _step = 1;
            });
          },
        ),
        const SizedBox(height: 28),
        
        Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.security, color: Colors.green, size: 16),
              const SizedBox(width: 6),
              Text(
                'Secure 256-bit SSL encrypted transactions',
                style: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChoiceBox({
    required String title,
    required String description,
    required IconData icon,
    required Color accentColor,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: accentColor.withOpacity(isLight ? 0.25 : 0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: accentColor.withOpacity(isLight ? 0.02 : 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(23),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: accentColor.withOpacity(0.4), width: 1.5),
                  ),
                  child: Icon(icon, color: accentColor, size: 30),
                ),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: TextStyle(fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 18),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: isLight ? Colors.black54 : Colors.white60, fontSize: 12, height: 1.4),
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    color: accentColor,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Give Now',
                        style: TextStyle(color: accentColor == const Color(0xFFFBBF24) ? const Color(0xFF0F172A) : Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.arrow_forward_rounded, size: 14, color: accentColor == const Color(0xFFFBBF24) ? const Color(0xFF0F172A) : Colors.white),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Step 1: Giving Details
  Widget _buildDetailsStep() {
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category Badge
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _selectedCause == 'Prophet Offering' ? const Color(0xFFFBBF24).withOpacity(0.2) : const Color(0xFF4F46E5).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _selectedCause == 'Prophet Offering' ? Icons.workspace_premium_rounded : Icons.language_rounded,
                  color: _selectedCause == 'Prophet Offering' ? const Color(0xFFFBBF24) : const Color(0xFF4F46E5),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('GIVING TO', style: TextStyle(color: isLight ? Colors.black38 : Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(_selectedCause, style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _step = 0),
                child: const Text('Change', style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Frequency Selector
        Text('Giving Frequency', style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: ['one-time', 'monthly', 'yearly'].map((item) {
              final isSelected = _frequency == item;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _frequency = item),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? (isLight ? Colors.white : const Color(0xFF1E1B4B)) : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isSelected ? const Color(0xFFFBBF24).withOpacity(0.3) : Colors.transparent),
                      boxShadow: isSelected && isLight
                          ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2))]
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        item.toUpperCase(),
                        style: TextStyle(
                          color: isSelected
                              ? (isLight ? const Color(0xFF4F46E5) : const Color(0xFFFBBF24))
                              : (isLight ? Colors.black45 : Colors.white60),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 24),

        // Amount Selector
        Text('Donation Amount (\$)', style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.1,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          children: _presetAmounts.map((val) {
            final isSelected = _amount == val;
            return GestureDetector(
              onTap: () {
                setState(() {
                  _amount = val;
                  _customAmountController.clear();
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFFBBF24).withOpacity(isLight ? 0.12 : 0.1)
                      : (isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.03)),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isSelected ? const Color(0xFFFBBF24) : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08))),
                ),
                child: Center(
                  child: Text(
                    '\$$val',
                    style: TextStyle(
                      color: isSelected ? const Color(0xFFFBBF24) : (isLight ? const Color(0xFF1E293B) : Colors.white),
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),

        // Custom Amount Input
        TextField(
          controller: _customAmountController,
          keyboardType: TextInputType.number,
          style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontWeight: FontWeight.bold),
          onChanged: (val) {
            setState(() {
              if (val.isNotEmpty) {
                _amount = 'custom';
              }
            });
          },
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.attach_money, color: Color(0xFFFBBF24)),
            hintText: 'Enter custom amount',
            hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30, fontWeight: FontWeight.normal),
            filled: true,
            fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: _amount == 'custom' ? const Color(0xFFFBBF24) : (isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08))),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFFBBF24), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Billing Details
        Text('Billing Details', style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        TextField(
          controller: _nameController,
          style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.person_outline, color: isLight ? Colors.black45 : Colors.white60),
            hintText: 'Full Name',
            hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
            filled: true,
            fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFFBBF24)),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _emailController,
          style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.mail_outline, color: isLight ? Colors.black45 : Colors.white60),
            hintText: 'Email Address',
            hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
            filled: true,
            fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFFBBF24)),
            ),
          ),
        ),
        const SizedBox(height: 28),

        // Actions
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _step = 0),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: isLight ? Colors.black26 : Colors.white.withOpacity(0.2)),
                  foregroundColor: isLight ? const Color(0xFF1E293B) : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _validateAndProceedToPayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFBBF24),
                  foregroundColor: const Color(0xFF0F172A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('Proceed (\$${_getFinalAmount().toStringAsFixed(0)})', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 2: Payment Details
  Widget _buildPaymentStep() {
    final amountToPay = _getFinalAmount();
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Simulate Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isLight ? const Color(0xFF1E293B) : Colors.white)),
            Text('\$${amountToPay.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24))),
          ],
        ),
        const SizedBox(height: 20),

        // Form fields
        TextField(
          controller: _cardNameController,
          style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.person_outline, color: isLight ? Colors.black45 : Colors.white60),
            hintText: 'Cardholder Name',
            hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
            filled: true,
            fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFFBBF24)),
            ),
          ),
        ),
        const SizedBox(height: 12),

        TextField(
          controller: _cardNumberController,
          style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
          keyboardType: TextInputType.number,
          onChanged: (value) {
            var text = value.replaceAll(' ', '');
            if (text.length > 16) text = text.substring(0, 16);
            var buffer = StringBuffer();
            for (int i = 0; i < text.length; i++) {
              buffer.write(text[i]);
              int nonZeroIndex = i + 1;
              if (nonZeroIndex % 4 == 0 && nonZeroIndex != text.length) {
                buffer.write(' ');
              }
            }
            var formatted = buffer.toString();
            if (_cardNumberController.text != formatted) {
              _cardNumberController.value = TextEditingValue(
                text: formatted,
                selection: TextSelection.collapsed(offset: formatted.length),
              );
            }
          },
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.credit_card, color: isLight ? Colors.black45 : Colors.white60),
            hintText: 'Card Number',
            hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
            filled: true,
            fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFFBBF24)),
            ),
          ),
        ),
        const SizedBox(height: 12),

        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _expiryController,
                style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  var text = value.replaceAll('/', '');
                  if (text.length > 4) text = text.substring(0, 4);
                  if (text.length >= 2) {
                    var formatted = '${text.substring(0, 2)}/${text.substring(2)}';
                    if (_expiryController.text != formatted) {
                      _expiryController.value = TextEditingValue(
                        text: formatted,
                        selection: TextSelection.collapsed(offset: formatted.length),
                      );
                    }
                  }
                },
                decoration: InputDecoration(
                  hintText: 'MM/YY',
                  hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                  filled: true,
                  fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFFBBF24)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _cvvController,
                style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white),
                obscureText: true,
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  if (value.length > 4) {
                    _cvvController.text = value.substring(0, 4);
                  }
                },
                decoration: InputDecoration(
                  hintText: 'CVV',
                  hintStyle: TextStyle(color: isLight ? Colors.black38 : Colors.white30),
                  filled: true,
                  fillColor: isLight ? Colors.black.withOpacity(0.04) : Colors.white.withOpacity(0.03),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.08)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFFBBF24)),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),

        // Actions
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _isProcessing ? null : () => setState(() => _step = 1),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: isLight ? Colors.black26 : Colors.white.withOpacity(0.2)),
                  foregroundColor: isLight ? const Color(0xFF1E293B) : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _simulatePayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFBBF24),
                  foregroundColor: const Color(0xFF0F172A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(0xFF0F172A)),
                      )
                    : Text('Donate \$${amountToPay.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 3: Success Screen
  Widget _buildSuccessStep() {
    final finalAmount = _getFinalAmount();
    final isLight = Theme.of(context).brightness == Brightness.light;
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.green.withOpacity(0.3), width: 1.5),
            ),
            child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 56),
          ),
          const SizedBox(height: 20),
          Text(
            'Thank you, ${_nameController.text}!',
            style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'Your gift of \$${finalAmount.toStringAsFixed(0)} to the $_selectedCause has been successfully simulated and completed.',
              textAlign: TextAlign.center,
              style: TextStyle(color: isLight ? Colors.black54 : Colors.white60, fontSize: 13, height: 1.4),
            ),
          ),
          const SizedBox(height: 28),

          // Receipt summary card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isLight ? const Color(0xFFF8FAFC) : Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isLight ? const Color(0xFFE2E8F0) : Colors.white.withOpacity(0.06)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Transaction ID', style: TextStyle(color: isLight ? Colors.black45 : Colors.white38, fontSize: 12)),
                    Text(_receiptId, style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 12, fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Selected Cause', style: TextStyle(color: isLight ? Colors.black45 : Colors.white38, fontSize: 12)),
                    Text(_selectedCause, style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Frequency', style: TextStyle(color: isLight ? Colors.black45 : Colors.white38, fontSize: 12)),
                    Text(_frequency.toUpperCase(), style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Donor Email', style: TextStyle(color: isLight ? Colors.black45 : Colors.white38, fontSize: 12)),
                    Text(_emailController.text, style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 12)),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: Divider(color: isLight ? Colors.black12 : Colors.white12),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Given', style: TextStyle(color: isLight ? const Color(0xFF1E293B) : Colors.white70, fontSize: 14, fontWeight: FontWeight.bold)),
                    Text('\$${finalAmount.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          ElevatedButton(
            onPressed: _resetForm,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFBBF24),
              foregroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Return to Giving Home', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
