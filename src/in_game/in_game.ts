// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.

import { OWGames, OWGamesEvents } from "@overwolf/overwolf-api-ts/dist";
import { kGamesFeatures } from "../consts";

// Like the background window, it also implements the Singleton design pattern.
class InGame {
  private static _instance: InGame;
  private gameEventsListener: OWGamesEvents

  private constructor() {
    console.log("Hello motherfcker")
  }

  public static instace(): InGame {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  private onInfoUpdates(info) {
    console.log("Info carai", info)
  }

  private onNewEvents(event) {
    console.log("Evento caria", event)
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
}

InGame.instace().run()
