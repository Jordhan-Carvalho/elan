import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
// new AppWindow(kWindowNames.desktop);
class Desktop extends AppWindow {
  private static _instance: Desktop;
  constructor() {
    super(kWindowNames.desktop)
  }

  public static instance(): Desktop {
    if (!this._instance) {
      this._instance = new Desktop();
    }

    return this._instance;
  }

  public async run() {
    console.log("Desktop created", this.remindersConfig)
  }
}

Desktop.instance().run()
