// Class with private methods (TypeScript)
class BankAccount {
  private balance: number = 0;
  
  // Used private method
  private validateAmount(amount: number): boolean {
    return amount > 0;
  }
  
  // Unused private method - should be detected as dead code
  private logTransaction(amount: number): void {
    console.log(`Transaction: ${amount}`);
  }
  
  // Public method using private method
  deposit(amount: number): void {
    if (this.validateAmount(amount)) {
      this.balance += amount;
    }
  }
  
  // Unused public method - should be detected as dead code
  withdraw(amount: number): void {
    if (this.validateAmount(amount)) {
      this.balance -= amount;
    }
  }
}

// Use class
const account = new BankAccount();
account.deposit(100);

