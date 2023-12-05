const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const { Web3 } = require('web3');
const web3 = new Web3(`https://goerli.infura.io/v3/${process.env.INFURA_KEY}`);

app.use(cors());
app.use(express.json()); // Middleware for parsing JSON bodies

const YOUR_PRIVATE_KEY = process.env.FAUCET_KEY; // Load private key from environment variables

app.post('/sendEth', async (req, res) => {
    const toAddress = req.body.toAddress;
    const amountInWei = web3.utils.toWei('0.01', 'ether');
    const fromAddress = web3.eth.accounts.privateKeyToAccount(YOUR_PRIVATE_KEY).address;

    try {
        const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
        // Use either the legacy or EIP-1559 way to set gas
        const gasPrice = await web3.eth.getGasPrice(); // For legacy transactions

        const transaction = {
            to: toAddress,
            value: amountInWei,
            gas: 21000,
            gasPrice: gasPrice, // For legacy transactions
            nonce: nonce
            // maxPriorityFeePerGas and maxFeePerGas for EIP-1559 transactions
        };

        const signedTx = await web3.eth.accounts.signTransaction(transaction, YOUR_PRIVATE_KEY);
        const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.send({ success: true, transactionHash: result.transactionHash });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});



app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
