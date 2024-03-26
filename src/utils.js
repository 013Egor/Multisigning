import BN from "bignumber.js";
import axios from "axios";
import { constants } from "./constants.js";

export function getBN(number, type = 10) {
	return new BN(number, type);
}

export function getLargeRandom() {
	return [0, 0, 0].map(() => Math.floor(Math.random() * 10e10)).join("");
}

export function findInverse(number, modulo) {
	const xgcdBN = (a, b) => {
		if (b.isEqualTo(0)) {
			return [getBN(1), getBN(0)];
		}

		const [x, y] = xgcdBN(
			b,
			a.minus(a.dividedBy(b).integerValue(BN.ROUND_FLOOR).multipliedBy(b))
		);

		return [
			y,
			x.minus(
				y.multipliedBy(a.dividedBy(b).integerValue(BN.ROUND_FLOOR))
			),
		];
	};

	const [result] = xgcdBN(getBN(number), getBN(modulo));

	return result;
}

export function getModulo(bigNumber, modulo) {
	if (bigNumber.isGreaterThanOrEqualTo(0)) {
		return bigNumber.modulo(modulo);
	}

	return getBN(modulo)
		.minus(bigNumber.multipliedBy(-1).mod(modulo))
		.mod(modulo);
}

export function getHexFromBytes(encoded) {
	let result = "";
	encoded.forEach((value) => {
		const hexValue = value.toString(16);
		result += hexValue.length % 2 == 1 ? "0" + hexValue : hexValue;
	});
	return "0x" + result;
}

export function getEth(value) {
	const eth = getBN("1000000000000000000");
	return "0x" + eth.multipliedBy(value).toString(16);
}

export function getGwei(value) {
	const eth = getBN("1000000000");
	return "0x" + eth.multipliedBy(value).toString(16);
}

export async function getNextNonce(address) {
	const rpcEndpoint = constants.RPC_URL;

	const requestData = {
		jsonrpc: "2.0",
		method: "eth_getTransactionCount",
		params: [address, "latest"],
		id: 1,
	};

	const axiosResult = await axios.post(rpcEndpoint, requestData);
	if (axiosResult.data?.result) {
		return axiosResult.data.result;
	}

	throw new Error("Didn't get nonce");
}
export async function sendTransaction(signedTransaction) {
	const rpcEndpoint = constants.RPC_URL;

	const requestData = {
		jsonrpc: "2.0",
		method: "eth_sendRawTransaction",
		params: [signedTransaction],
		id: 1,
	};

	const axiosResult = await axios.post(rpcEndpoint, requestData);

	if (axiosResult.data.error) {
		console.log(axiosResult.data.error);
		throw new Error(axiosResult.data.error);
	}
}
