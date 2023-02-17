export declare function generateKeys(bits: number): [bigint, bigint, bigint];
export declare function encrypt(data: bigint, publicKey: bigint, modulo: bigint): bigint;
export declare function decrypt(encrypted: bigint, secretKey: bigint, modulo: bigint): bigint;
export declare function pad(data: bigint, bits: number): bigint;
export declare function unpad(padded: bigint): bigint;
