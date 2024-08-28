import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favourites } from "../target/types/favourites";
import { assert } from "chai";

describe("favourites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Favourites as Program<Favourites>;
  const provider = anchor.AnchorProvider.env();
  const user = (provider.wallet as anchor.Wallet).payer;

  it("Is initialized!", async () => {
    // Setup
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    const balanceInSol = balance / 1e9;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSol);
    console.log(`Balance before: ${formattedBalance} SOL`);

    const favouriteNumber = new anchor.BN(7);
    const favouriteColor = 'red';
    const favouriteThings = ['bike'];

    // Transaction
    const tx = await program.methods.create(favouriteNumber, favouriteColor, favouriteThings)
      .signers([user]).rpc();

    // Checks

    const balanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);
    const balanceInSolAfter = balanceAfter / 1e9;
    const formattedBalanceAfter = new Intl.NumberFormat().format(balanceInSolAfter);

    console.log(`Balance after: ${formattedBalanceAfter} SOL`);

    const [favouritesAddress, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("favourites"), user.publicKey.toBuffer()], program.programId);

    const favouritesAccount = await program.account.favourites.fetch(favouritesAddress);

    assert.equal(favouritesAccount.number.toString(), favouriteNumber.toString());
    assert.equal(favouritesAccount.color, favouriteColor);
    assert.deepEqual(favouritesAccount.hobbies, favouriteThings);
  });

  it("Hacker", async () => {
    const randomHacker = anchor.web3.Keypair.generate();

    try {
      await program.methods.create(new anchor.BN(8), 'blue', ['hulajnoga'])
        .signers([randomHacker])
        .rpc();

      assert.fail("This should not happen");
    } catch (error) {
      assert.isTrue(error.toString().includes("unknown signer:"));
    }
  });

  it("Friend", async () => {
    const friend = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(friend.publicKey, 1000000000);

    await new Promise(r => setTimeout(r, 400));

    await program.methods.create(new anchor.BN(8), 'blue', ['hulajnoga'])
      .accounts(
        {
          user: friend.publicKey
        }
      )
      .signers([friend])
      .rpc();

    const [favouritesAddress, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("favourites"), friend.publicKey.toBuffer()], program.programId);

    const favouritesAccount = await program.account.favourites.fetch(favouritesAddress);

    console.log("Favourites account", favouritesAccount);


  });
});


