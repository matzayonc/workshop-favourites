import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favourites } from "../target/types/favourites";
import { assert } from "chai";

describe("favourites", () => {
  // Configure the client to use the local cluster.
  // Load private key from the local file.
  anchor.setProvider(anchor.AnchorProvider.env());

  // Set program to be able to interact with it.
  const program = anchor.workspace.Favourites as Program<Favourites>;

  // Extract the provider from the program for convenience.
  const provider = anchor.AnchorProvider.env();

  // Analogous to the keypair.
  const user = (provider.wallet as anchor.Wallet).payer;

  it("Is initialized!", async () => {
    // Setup
    // Get the balance of the user in Sol.
    const balance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    const balanceInSol = balance / 1e9;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSol);
    console.log(`Balance before: ${formattedBalance} SOL`);

    // Set parameters, so input to the instruction.
    const favouriteNumber = new anchor.BN(7);
    const favouriteColor = "red";
    const favouriteThings = ["bike"];

    // Execute the instruction on the local network.
    const tx = await program.methods
      .create(favouriteNumber, favouriteColor, favouriteThings)
      .signers([user])
      .rpc();

    // Fetch Sol balance after the transaction.
    const balanceAfter = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    const balanceInSolAfter = balanceAfter / 1e9;
    const formattedBalanceAfter = new Intl.NumberFormat().format(
      balanceInSolAfter
    );
    console.log(`Balance after: ${formattedBalanceAfter} SOL`);

    // Generate the address of the Favourites account.
    const [favouritesAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favourites"), user.publicKey.toBuffer()],
      program.programId
    );

    // Fetch the Favourites account from the network.
    const favouritesAccount = await program.account.favourites.fetch(
      favouritesAddress
    );

    // Perform assertions to check whether the transaction was successful.
    assert.equal(
      favouritesAccount.number.toString(),
      favouriteNumber.toString()
    );
    assert.equal(favouritesAccount.color, favouriteColor);
    assert.deepEqual(favouritesAccount.hobbies, favouriteThings);
  });

  it("Hacker", async () => {
    // Generate a random keypair.
    // This keypair is not authorized to sign transactions so the transaction should fail.
    const randomHacker = anchor.web3.Keypair.generate();

    try {
      // This should fail because the randomHacker keypair is not authorized to sign transactions.
      await program.methods
        .create(new anchor.BN(8), "blue", ["hulajnoga"])
        .signers([randomHacker])
        .rpc();

      // If the transaction is successful, the test should fail.
      assert.fail("This should not happen");
    } catch (error) {
      // Check if the error message contains the expected error.
      assert.isTrue(error.toString().includes("unknown signer:"));
    }
  });

  it("Friend", async () => {
    // The Anchor framework will automatically sign the transaction with the user's keypair.
    // We want to sign with a different keypair, so we need to create a new keypair and request some funds.
    const otherUser = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);

    // Wait for the funds to be available.
    await new Promise((r) => setTimeout(r, 400));

    // Execute the instruction on the local network.
    await program.methods
      .create(new anchor.BN(8), "blue", ["scooter"])
      .accounts({
        user: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    // Generate the address of the Favourites account of the otherUser.
    const [favouritesAddress, _] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favourites"), otherUser.publicKey.toBuffer()],
        program.programId
      );

    // Fetch the Favourites account of the otherUser from the network.
    const favouritesAccount = await program.account.favourites.fetch(
      favouritesAddress
    );

    // Check if the transaction changed state in the expected way.
    assert.equal(
      favouritesAccount.number.toString(),
      '8'
    );
    assert.equal(favouritesAccount.color, 'blue');
    assert.deepEqual(favouritesAccount.hobbies, ['scooter']);
  });
});
