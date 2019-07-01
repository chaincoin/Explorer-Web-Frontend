


function build()
{
	
const LOCKTIME_THRESHOLD = 0x1dcd6500 // 500000000

function decode (lockTime) {
  if (lockTime >= LOCKTIME_THRESHOLD) {
    return {
      utc: lockTime
    }
  }

  return {
    blocks: lockTime
  }
}

function encode (obj) {
  let blocks = obj.blocks
  let utc = obj.utc
  if (blocks !== undefined && utc !== undefined) throw new TypeError('Cannot encode blocks AND utc')
  if (blocks === undefined && utc === undefined) return 0 // neither?

  if (utc !== undefined) {
    if (!Number.isFinite(utc)) throw new TypeError('Expected Number utc')
    if (utc < LOCKTIME_THRESHOLD) throw new TypeError('Expected Number utc >= ' + LOCKTIME_THRESHOLD)

    return utc
  }

  if (!Number.isFinite(blocks)) throw new TypeError('Expected Number blocks')
  if (blocks >= LOCKTIME_THRESHOLD) throw new TypeError('Expected Number blocks < ' + LOCKTIME_THRESHOLD)

  return blocks
}
	
debugger;

var ChaincoinNetwork = {
  messagePrefix: 'DarkCoin Signed Message:\n',
  bip32: {
	public: 0x02FE52F8,
	private: 0x02FE52CC
  },
  bech32: "chc",
  pubKeyHash: 0x1C,
  scriptHash: 0x04,
  wif: 0x9C
};

var hashType = bitcoin.Transaction.SIGHASH_ALL

var hashLockKey = Buffer.from("00000000000000000000","hex"); //TODO: this needs to be random



var hashLock = bitcoin.crypto.sha256(hashLockKey);


var aliceKeyPair = bitcoin.ECPair.fromWIF('QDJDx4kmFme7tXhckgu7rwjT8rZm8sgz4Bn5DH2TPzs2S2iVDp5B',ChaincoinNetwork);
var aliceAddress = bitcoin.payments.p2wpkh({pubkey: aliceKeyPair.publicKey, network: ChaincoinNetwork})


var bobKeyPair = bitcoin.ECPair.fromWIF('QCbooKSvENoZC5WiFBzKNVvk7hSpNWyXBXs7TvM2Sd5F8Y7HwXrJ',ChaincoinNetwork);
var bobAddress = bitcoin.payments.p2wpkh({pubkey: bobKeyPair.publicKey, network: ChaincoinNetwork})



var lockTime = encode({ utc: Math.floor(new Date('2019-06-29 21:00:00') / 1000)})
//const lockTime = bip65.encode({ utc: Math.floor(new Date('2019-06-29 00:00:00') / 1000 + (3600 * 48) }) //lock for 2 days //TODO: put this back




var redeemScript = bitcoin.script.compile([].concat(
  bitcoin.opcodes.OP_IF,
  bitcoin.opcodes.OP_SHA256,
  hashLock,
  bitcoin.opcodes.OP_EQUALVERIFY,
  bobAddress.pubkey,
  bitcoin.opcodes.OP_ELSE,
  bitcoin.script.number.encode(lockTime),
  bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
  bitcoin.opcodes.OP_DROP,
  aliceAddress.pubkey,
  bitcoin.opcodes.OP_ENDIF,
  bitcoin.opcodes.OP_CHECKSIG,
));

//var redeemScript = bitcoin.script.compile([bitcoin.opcodes.OP_0, bitcoin.crypto.sha256(witnessScript)]);  //not sure about this
//var scriptPubKey = bitcoin.script.compile([bitcoin.opcodes.OP_HASH160, bitcoin.crypto.hash160(redeemScript), bitcoin.opcodes.OP_EQUAL]); 
//var address = bitcoin.address.fromOutputScript(scriptPubKey,ChaincoinNetwork);
var p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network: ChaincoinNetwork},  network: ChaincoinNetwork})
var contractAddress = p2sh.address; //2cQsAWWiDc8JzsZMDN2J8tRDCNGTb2q5Ww




//bobs transaction
const bobsTxb = new bitcoin.TransactionBuilder(ChaincoinNetwork);
bobsTxb.setVersion(3);
bobsTxb.setLockTime(lockTime);
bobsTxb.addInput('96951ea1ad0fe69379a4a48665fc3d74510d1c75a369c9746f76a54ebfae5662', 0, 0xfffffffe);   //txb.addInput('TX_ID', TX_VOUT, [sequence])
bobsTxb.addOutput(bobAddress.address, 999e5);
const bobsTx = bobsTxb.buildIncomplete();
const bobsSignatureHash = bobsTx.hashForSignature(0, redeemScript, hashType);

const bobsInputScript = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(bobKeyPair.sign(bobsSignatureHash), hashType),
	  hashLockKey,
      bitcoin.opcodes.OP_TRUE,
    ]),
    output: redeemScript
  },
}).input

bobsTx.setInputScript(0, bobsInputScript)
var bobsTxHex = bobsTx.toHex();

//Alices transaction
const aliceTxb = new bitcoin.TransactionBuilder(ChaincoinNetwork);
aliceTxb.setVersion(3);
aliceTxb.setLockTime(lockTime);
aliceTxb.addInput('96951ea1ad0fe69379a4a48665fc3d74510d1c75a369c9746f76a54ebfae5662', 0, 0xfffffffe);   //txb.addInput('TX_ID', TX_VOUT, [sequence])
aliceTxb.addOutput(aliceAddress.address, 999e5);
const aliceTx = aliceTxb.buildIncomplete();
const aliceSignatureHash = aliceTx.hashForSignature(0, redeemScript, hashType);

const aliceInputScript = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      bitcoin.script.signature.encode(aliceKeyPair.sign(aliceSignatureHash), hashType),
      bitcoin.opcodes.OP_FALSE,
    ]),
    output: redeemScript
  },
}).input

aliceTx.setInputScript(0, aliceInputScript)
var aliceTxHex = aliceTx.toHex();
debugger;
};
build();






