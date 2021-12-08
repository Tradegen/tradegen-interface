//Main net
const tokens = {
    WETH: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
    WBTC: "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE",
    mcUSD: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    cMCO2: "0x32A9FE697a32135BFd313a6Ac28792DaE4D9979d",
    MOO: "0x17700282592D6917F6A73D0bF8AcCf4D578c131e",
    SOL: "0x173234922eB27d5138c5e481be9dF5261fAeD450",
    POOF: "0x00400FcbF0816bebB94654259de7273f4A05c762",
    UBE: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438"
}

//Main net
const paths = {
    WETH: [tokens.mcUSD, tokens.CELO, tokens.UBE],
    WBTC: [tokens.mcUSD, tokens.WBTC],
    cMCO2: [tokens.mcUSD, tokens.CELO, tokens.UBE, tokens.cMCO2],
    MOO: [tokens.mcUSD, tokens.CELO, tokens.MOO],
    SOL: [tokens.mcUSD, tokens.CELO, tokens.SOL],
    POOF: [tokens.mcUSD, tokens.CELO, tokens.UBE, tokens.POOF],
    UBE: [tokens.mcUSD, tokens.CELO, tokens.UBE],
    CELO: [tokens.mcUSD, tokens.CELO]
}

//Get optimal path on mainnet
export function getPath(from, to) {
    if (typeof(from) !== "string" || typeof(to) !== "string")
    {
        return undefined;
    }

    //"from" token not supported
    if (tokens[from] === undefined)
    {
        return undefined;
    }

    //"to" token not supported
    if (tokens[to] === undefined)
    {
        return undefined;
    }

    //swap from mcUSD to token
    if (from == "mcUSD")
    {
        return paths[to].slice();
    }

    //swap from token to mcUSD
    if (to == "mcUSD")
    {
        var temp = paths[to].slice();
        return temp.reverse();
    }

    //Reverse array, remove "mcUSD", and concat
    var temp = paths[from].slice();
    console.log(paths);
    var temp2 = paths[to].slice();
    console.log(temp2);
    temp = temp.reverse();
    console.log(temp);
    temp.pop();
    console.log(temp);
    return temp.concat(temp2);
}