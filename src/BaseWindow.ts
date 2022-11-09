import { OWWindow } from "@overwolf/overwolf-api-ts";

interface RemindersConfig {
  [key: string]: { active: boolean, delay: number }
}

// A base class for the app's foreground windows.
// Sets the modal and drag behaviors, which are shared accross the desktop and in-game windows.
export class BaseWindow {
  protected currWindow: OWWindow;
  protected mainWindow: OWWindow;
  protected maximized = false;
  protected remindersConfig: RemindersConfig = {};

  constructor(windowName: string) {
    this.mainWindow = new OWWindow('background');
    this.currWindow = new OWWindow(windowName);

    const closeButton = document.getElementById('closeButton');
    const maximizeButton = document.getElementById('maximizeButton');
    const minimizeButton = document.getElementById('minimizeButton');


    closeButton.addEventListener('click', () => {
      this.mainWindow.close();
    });

    minimizeButton.addEventListener('click', () => {
      this.currWindow.minimize();
    });

    maximizeButton.addEventListener('click', () => {
      if (!this.maximized) {
        this.currWindow.maximize();
      } else {
        this.currWindow.restore();
      }

      this.maximized = !this.maximized;
    });

    this.setAppDragBehavior()

    this.remindersConfigurationListener("neutral")
    this.remindersConfigurationListener("stack")
    this.remindersConfigurationListener("bountyrunes")
    this.remindersConfigurationListener("midrunes")
    this.remindersConfigurationListener("smoke")
    this.remindersConfigurationListener("ward")

  }

  private async setDrag(elem: HTMLElement) {
    this.currWindow.dragMove(elem);
  }

  public async getWindowState() {
    return await this.currWindow.getWindowState();
  }

  private setAppDragBehavior() {
    const body = document.querySelector('header')
    const alertsContainer = document.querySelector('.alerts-container') as HTMLElement

    this.setDrag(alertsContainer)
    this.setDrag(body);
  }

  private remindersConfigurationListener(reminderName: string) {
    console.log("run the configuration listener")
    const checkBox = document.getElementById(`${reminderName}-checkbox`) as HTMLInputElement
    checkBox.addEventListener('change', () => {
      if (checkBox.checked) {
        this.remindersConfig[reminderName].active = false;
      } else {
        this.remindersConfig[reminderName].active = true;
      }
    })

    const delayElem = document.getElementById(`${reminderName}-delay`) as HTMLInputElement
    const delay = delayElem ? Number(delayElem.value) : 0
    this.remindersConfig[reminderName] = { active: !checkBox.checked, delay} 

    delayElem && delayElem.addEventListener('change', () => {
      this.remindersConfig[reminderName].delay = Number(delayElem.value)
    })
  }


}
