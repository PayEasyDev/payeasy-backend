const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test endpoint
app.get('/', (req, res) => res.send('Backend is running'));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//APIs
app.post('/signup', async (req, res) => {
    const { email, password, username, phone_number } = req.body;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) return res.status(400).json({ error: error.message });

    // Create profile
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username, phone_number });
    if (profileError) return res.status(400).json({ error: profileError.message });

    res.json({ user: data.user });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data.user, token: data.session.access_token });
});

// const CryptoJS = require('crypto-js');

// app.post('/add-payment-method', async (req, res) => {
//     const { user_id, type, details } = req.body; // type: 'card' or 'bank', details: { card_number, expiry, cvv } or { bank_name, account_number }
//     try {
//         // Encrypt sensitive details
//         const encryptedDetails = CryptoJS.AES.encrypt(
//             JSON.stringify(details),
//             process.env.ENCRYPTION_KEY
//         ).toString();

//         // Store only last 4 digits for display
//         const displayInfo = type === 'card' ? details.card_number.slice(-4) : details.account_number.slice(-4);

//         const { error } = await supabase
//             .from('payment_methods')
//             .insert({
//                 user_id,
//                 type,
//                 encrypted_details: encryptedDetails,
//                 display_info: displayInfo,
//                 is_default: true,
//             });
//         if (error) return res.status(400).json({ error: error.message });

//         res.json({ message: 'Payment method added', display_info: displayInfo });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.get('/payment-methods/:user_id', async (req, res) => {
//     const { user_id } = req.params;
//     try {
//         const { data, error } = await supabase
//             .from('payment_methods')
//             .select('id, type, display_info, is_default')
//             .eq('user_id', user_id);
//         if (error) return res.status(400).json({ error: error.message });
//         res.json(data);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.get('/search-user', async (req, res) => {
//     const { username } = req.query;
//     const { data, error } = await supabase
//         .from('profiles')
//         .select('id, username')
//         .eq('username', username)
//         .single();
//     if (error) return res.status(400).json({ error: error.message });
//     res.json(data);
// });