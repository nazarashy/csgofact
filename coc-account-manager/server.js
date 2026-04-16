const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'accounts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Clash of Clans API Configuration
const COC_API_BASE_URL = 'https://developer.clashofclans.com/api';
let cocApiKey = process.env.COC_API_KEY || '';

// In-memory storage (will be persisted to file)
let accounts = [];

// Load accounts from file
async function loadAccounts() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        accounts = JSON.parse(data);
        console.log(`Loaded ${accounts.length} accounts`);
    } catch (error) {
        console.log('No existing accounts file, starting fresh');
        accounts = [];
    }
}

// Save accounts to file
async function saveAccounts() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
        console.log('Accounts saved successfully');
    } catch (error) {
        console.error('Error saving accounts:', error);
    }
}

// Initialize
loadAccounts();

// Set CoC API Key
app.post('/api/coc-key', (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
    }
    cocApiKey = apiKey;
    res.json({ message: 'API key set successfully' });
});

// Get all accounts
app.get('/api/accounts', (req, res) => {
    res.json(accounts);
});

// Add new account
app.post('/api/accounts', async (req, res) => {
    const { email, password, playerTag } = req.body;
    
    if (!email || !password || !playerTag) {
        return res.status(400).json({ 
            error: 'Email, password, and player tag are required' 
        });
    }
    
    // Validate player tag format (should start with #)
    const formattedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
    
    const newAccount = {
        id: uuidv4(),
        email,
        password,
        playerTag: formattedTag,
        status: 'Прокачка', // Default status: "Прокачка" (Leveling)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    await saveAccounts();
    
    res.status(201).json(newAccount);
});

// Update account status
app.patch('/api/accounts/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Прокачка', 'Продан'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
    }
    
    const accountIndex = accounts.findIndex(acc => acc.id === id);
    if (accountIndex === -1) {
        return res.status(404).json({ error: 'Account not found' });
    }
    
    accounts[accountIndex].status = status;
    accounts[accountIndex].updatedAt = new Date().toISOString();
    
    await saveAccounts();
    res.json(accounts[accountIndex]);
});

// Update account data
app.put('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password, playerTag, status } = req.body;
    
    const accountIndex = accounts.findIndex(acc => acc.id === id);
    if (accountIndex === -1) {
        return res.status(404).json({ error: 'Account not found' });
    }
    
    if (email) accounts[accountIndex].email = email;
    if (password) accounts[accountIndex].password = password;
    if (playerTag) {
        accounts[accountIndex].playerTag = playerTag.startsWith('#') 
            ? playerTag 
            : `#${playerTag}`;
    }
    if (status) {
        const validStatuses = ['Прокачка', 'Продан'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }
        accounts[accountIndex].status = status;
    }
    
    accounts[accountIndex].updatedAt = new Date().toISOString();
    
    await saveAccounts();
    res.json(accounts[accountIndex]);
});

// Delete account
app.delete('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    
    const accountIndex = accounts.findIndex(acc => acc.id === id);
    if (accountIndex === -1) {
        return res.status(404).json({ error: 'Account not found' });
    }
    
    accounts.splice(accountIndex, 1);
    await saveAccounts();
    
    res.json({ message: 'Account deleted successfully' });
});

// Fetch account info from CoC API
app.get('/api/accounts/:id/coc-info', async (req, res) => {
    const { id } = req.params;
    
    if (!cocApiKey) {
        return res.status(400).json({ 
            error: 'CoC API key not set. Use POST /api/coc-key to set it.' 
        });
    }
    
    const account = accounts.find(acc => acc.id === id);
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }
    
    try {
        // Remove # from tag for API call and encode it
        const tag = account.playerTag.replace('#', '');
        const encodedTag = encodeURIComponent(tag);
        
        const response = await fetch(
            `${COC_API_BASE_URL}/players/%23${encodedTag}`,
            {
                headers: {
                    'Authorization': `Bearer ${cocApiKey}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`CoC API error: ${response.status}`);
        }
        
        const cocData = await response.json();
        res.json(cocData);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch CoC data', 
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET    /api/accounts           - Get all accounts');
    console.log('  POST   /api/accounts           - Add new account');
    console.log('  PATCH  /api/accounts/:id/status - Update account status');
    console.log('  PUT    /api/accounts/:id       - Update account data');
    console.log('  DELETE /api/accounts/:id       - Delete account');
    console.log('  GET    /api/accounts/:id/coc-info - Fetch CoC API data');
    console.log('  POST   /api/coc-key            - Set CoC API key');
});
