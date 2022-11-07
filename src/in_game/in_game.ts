// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.

import { OWGames, OWGamesEvents } from "@overwolf/overwolf-api-ts/dist";
import { kGamesFeatures } from "../consts";


interface ActiveAlerts {
  stack: boolean
}
// Like the background window, it also implements the Singleton design pattern.
class InGame {
  private static _instance: InGame;
  private gameEventsListener: OWGamesEvents
  private activeAlerts: ActiveAlerts;

  private constructor() {
    this.activeAlerts = {
      stack: true,
    }
  }

  public static instace(): InGame {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  private onInfoUpdates(info) {
    console.log("Info", info)
  }

  private onNewEvents(e) {
    e.events.map(event => {
      switch (event.name) {
        case 'clock_time_changed':
          const parsedClockInfo = JSON.parse(event.data)
          if (this.activeAlerts.stack) {
            this.checkForStack(parsedClockInfo.clock_time)
          }
      }
    });
  }

  public async run() {
    const gameClassId = await this.getCurrentGameClassId();
    const gameFeatures = kGamesFeatures.get(gameClassId);

    if (gameFeatures && gameFeatures.length) {
      this.gameEventsListener = new OWGamesEvents({ onInfoUpdates: this.onInfoUpdates.bind(this), onNewEvents: this.onNewEvents.bind(this) }, gameFeatures)

      this.gameEventsListener.start();
    }

  }

  private async getCurrentGameClassId(): Promise<number | null> {
    const info = await OWGames.getRunningGameInfo()
    const isGameRunningAndAvailable = info && info.isRunning && info.classId

    return isGameRunningAndAvailable ? info.classId : null
  }

  private checkForStack(gameTime: number) {
    const stackReminderTime = 15;
    const stackTime = 60

    if ((gameTime-stackReminderTime)%stackTime === 0) {
      const audio = new Audio("../sound/stack.mp3")
      audio.play();
    }
  } 
}

InGame.instace().run()
