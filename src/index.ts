function expMod(base: bigint, exponent: bigint, mod: bigint): bigint {
	let result = 1n
	while (exponent != 0n) {
		if (exponent % 2n == 1n) {
			result = (result * base) % mod
			// Should substract 1 from exponent, but
		}
		exponent = exponent >> 1n // This automatically takes care of it
		base = (base * base) % mod
	}
	return result
}

// returns [a,b] such that n = 2^a * b
function splitPowerOf2(n: bigint): [bigint, bigint] {
	let exponent = 0n

	while ((n & 1n) == 0n) {
		n = n >> 1n
		exponent++
	}

	return [exponent, n]
}

// where bits % 4 = 0
function randomBigInt(bits: number): bigint {
  const characters = "0123456789abcdef"
  let string = characters.charAt(Math.floor(Math.random() * (characters.length-1))+1)
  for (let i = 0; i < bits/4-1; i++) {
	string += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return BigInt("0x" + string)
}

function testPrimesUpTo100(n: bigint) {
	for (let p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n]) {
		if (n % p === 0n) {
			return false
		}
	}
	return true
}

// https://www.youtube.com/watch?v=gIODPTiD_o0
function millerRabin(n: bigint, times: number): boolean {
	let nMinusOne = n - 1n
	let [k, m] = splitPowerOf2(nMinusOne)
	let testBits = n.toString(16).length*4 - 4

	for (let i = 0; i < times; i++) {
		let a = randomBigInt(testBits) + 1n
		let b = expMod(a, m, n)
		if (b == 1n || b == nMinusOne) {
			continue
		} else {
			let found = false
			for (let r = 1n; r < k; r++) {
				if (expMod(b, 2n**r, n) == nMinusOne) {
					found = true
				}
			}
			if (!found) {
				return false
			}
		}
	}
	return true
}

function generatePrime(bits: number): bigint {
	let n = randomBigInt(bits)
	if (n % 2n == 0n) {
		n++
	}
	while (!testPrimesUpTo100(n) || !millerRabin(n, 64)) {
		n += 2n
	}
	return n
}


function extendedEuclidean(a: bigint, b: bigint): [bigint, bigint, bigint]|null {
	let s = 0n
	let lastS = 1n
	let t = 1n
	let lastT = 0n

	for (let i = 0; i < 1000000; i++) {
		let q =  a / b
		let r = a % b

		if (r == 0n) {
			return [b, s, t]
		}

		let newS = lastS - (q * s)
		let newT = lastT - (q * t)
		lastS = s
		lastT = t
		s = newS
		t = newT

		a = b
		b = r
	}
	return null
}

// Returns [publicKey, secretKey, modulo]
export function generateKeys(bits: number): [bigint, bigint, bigint] {
	let p = generatePrime(bits)
	let q = generatePrime(bits)
	let n = p * q
	let phi = (p - 1n) * (q - 1n)
	let e = 65537n

	let [gcd, d, _] = extendedEuclidean(e, phi) || [0n, 0n, 0n]
	if (gcd != 1n) {
		// The numbers are not prime (extremely unlikely)
		console.log("Pseudoprimes are composite, trying again...")
		return generateKeys(bits)
	}

	return [e, d, n]
}

export function encrypt(data: bigint, publicKey: bigint, modulo: bigint): bigint {
	return expMod(data, publicKey, modulo)
}

export function decrypt(encrypted: bigint, secretKey: bigint, modulo: bigint): bigint {
	return expMod(encrypted, secretKey, modulo)
}

// Data size <= bits - 6 nibbles = bits-24
// Padded size == bits - 2 nibbles = bits-8
export function pad(data: bigint, bits: number): bigint {
	let totalNibbles = bits/4 - 2
	let padded = "f" + data.toString(16)
	// Header indicating the number of nibbles
	let dataNibbles = padded.length.toString(16).padStart(4, "0")

	while (padded.length < totalNibbles) {
		padded = padded + padded
	}
	padded = padded.substring(0, totalNibbles-4) + dataNibbles

	return BigInt("0x0" + padded)
}

// Data size <= bits - 6 nibbles = bits-24
// Padded size == bits - 2 nibbles = bits-8
export function unpad(padded: bigint): bigint {
	let paddedString = padded.toString(16)
	let dataNibbles = Number("0x0" + paddedString.slice(-4))
	let data = paddedString.substring(1, dataNibbles)
	return BigInt("0x0" + data)
}
