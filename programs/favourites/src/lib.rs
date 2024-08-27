use anchor_lang::prelude::*;

declare_id!("7eLAo756veqmTo4192BLmjTW3pfeZMQYjis1zU6SLX64");

#[program]
pub mod favourites {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
