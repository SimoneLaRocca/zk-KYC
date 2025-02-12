import { initialize } from "zokrates-js";
import * as fs from "fs";

async function main() {
    const zokratesProvider = await initialize();
    const payroll_1 = JSON.parse(fs.readFileSync('../payroll1.json', 'utf8'));
    const payroll_2 = JSON.parse(fs.readFileSync('../payroll2.json', 'utf8'));
    const payroll_3 = JSON.parse(fs.readFileSync('../payroll3.json', 'utf8'));
    
    let employmentType = payroll_1["Employment Type"] === "Permanent Contract" ? "0" : "1";
    let sector = payroll_1["Pension Fund"] === "INPDAP" ? "0" : "1";
    
    const payrolls = [payroll_1, payroll_2, payroll_3];

    const netTotal = [];
    const assignableFifth = [];

    for (let i = 0; i < payrolls.length; i++) {
        netTotal.push(payrolls[i]["Net Total"]);
        assignableFifth.push(payrolls[i]["Assignable Fifth"]);
    }

    const input = [
        employmentType,
        sector,
        payroll_1["Year of Birth"],
        netTotal,
        assignableFifth,
        "2025"
    ];

    console.log("Input:", input);

    const source = fs.readFileSync("risk_profile_1.zok", 'utf8');
    
    // Compilation
    const artifacts = zokratesProvider.compile(source);
    
    // Computation
    const { witness, output } = zokratesProvider.computeWitness(artifacts, input);
    
    console.log("Witness:", witness);
    console.log("Output:", output);
    
    // run setup
    const keypair = zokratesProvider.setup(artifacts.program);
    
    // Generate proof
    const proof = zokratesProvider.generateProof(
        artifacts.program,
        witness,
        keypair.pk
    );
    
    console.log("Proof:", proof);

    const isVerified = zokratesProvider.verify(keypair.vk, proof);
    
    console.log('Result: ', isVerified);
}

main().catch(console.error);
