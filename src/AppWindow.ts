import { OWWindow } from "@overwolf/overwolf-api-ts";

interface RemindersConfig {
  [key: string]: { active: boolean, delay: number }
}

// A base class for the app's foreground windows.
// Sets the modal and drag behaviors, which are shared accross the desktop and in-game windows.
export class AppWindow {
  protected currWindow: OWWindow;
  protected mainWindow: OWWindow;
  protected maximized = false;
  protected remindersConfig: RemindersConfig;

  constructor(windowName: string) {
    console.log("Contructor da appwindow")
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

  }

  // public async getWindowState() {
  //   return await this.currWindow.getWindowState();
  // }

  private async setDrag(elem: HTMLElement) {
    this.currWindow.dragMove(elem);
  }


  private setAppDragBehavior() {
    const body = document.querySelector('header')
    const alertsContainer = document.querySelector('.alerts-container') as HTMLElement

    this.setDrag(alertsContainer)
    this.setDrag(body);
  }

  /* private remindersConfigListener() {
    const stackActiveCheckbox = document.getElementById('stack-checkbox') as HTMLInputElement
    const stackDelay = document.getElementById('stack-delay') as HTMLInputElement
    this.remindersConfig = { stack: { active: !stackActiveCheckbox.checked, delay: Number(stackDelay.value) } }

    stackActiveCheckbox.addEventListener('change', () => {
      // checked will show the red button with a NO
      if (stackActiveCheckbox.checked) {
        this.remindersConfig.stack.active = false;
       } else {
        this.remindersConfig.stack.active = true;
      }
    }) 

    stackDelay.addEventListener('change', () => {
      console.log("STACK DELAY VALUE", stackDelay.value)
      this.remindersConfig.stack.delay = Number(stackDelay.value)
    });
  } */

  private remindersConfigurationListener(reminderName: string) {
    const checkBox = document.getElementById(`${reminderName}-checkbox`) as HTMLInputElement
    const delay = document.getElementById(`${reminderName}-delay`) as HTMLInputElement

    this.remindersConfig[reminderName] = { active: !checkBox.checked, delay: Number(delay.value)} 

    checkBox.addEventListener('change', () => {
      if (checkBox.checked) {
        this.remindersConfig[reminderName].active = false;
      } else {
        this.remindersConfig[reminderName].active = true;
      }
    })

    delay.addEventListener('change', () => {
      this.remindersConfig[reminderName].delay = Number(delay.value)
    })
  }
}
