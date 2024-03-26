import { signMessage } from "./src/ecdsa.js";
import {
	getHexFromBytes,
	getNextNonce,
	getEth,
	getGwei,
	sendTransaction,
} from "./src/utils.js";
import "dotenv/config";
import RLP from "rlp";
import sha3 from "js-sha3";

async function main() {
	const chainId = null;
	const addressFrom = process.env.ADDRESS_FROM;
	const privateKey = process.env.PRIVATE_KEY;

	const nonce = await getNextNonce(addressFrom);
	const gasPrice = getGwei(22);
	const gasLimit = getGwei(0.006);
	const to = process.env.ADDRESS_TO;
	const value = getEth(1);
	const data = "0x00";

	const encoded = RLP.encode([nonce, gasPrice, gasLimit, to, value, data]);

	const hashValueOrigin = "0x" + sha3.keccak_256(encoded);
	const signedEncode = signMessage(hashValueOrigin, privateKey);

	let v = 28 + (signedEncode.r % 2);
	if (chainId) {
		v += chainId * 2 + 8;
	}

	let signedTransaction = RLP.encode([
		nonce,
		gasPrice,
		gasLimit,
		to,
		value,
		data,
		"0x" + v.toString(16),
		signedEncode.r,
		signedEncode.s,
	]);

	await sendTransaction(getHexFromBytes(signedTransaction));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
