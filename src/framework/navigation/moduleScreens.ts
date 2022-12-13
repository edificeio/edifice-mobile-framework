/**
 * ModuleScreens is a collection used to register screens that are rendered in the main StackNavigator.
 */

export class ModuleScreens {
  static $items: { [key: string]: React.ReactNode } = {};

  static register(name: string, item: React.ReactNode) {
    this.$items[name] = item;
    return item; // Allow chaining
  }

  static get(name: string) {
    if (this.$items.hasOwnProperty(name)) {
      return this.$items[name];
    } else {
      throw new Error(`[ModuleScreens] No reducer of name ${name} has been registred.`);
    }
  }

  static get all() {
    return Object.values(this.$items) as React.ReactNode[];
  }

  static clear() {
    this.$items = {};
  }
}
