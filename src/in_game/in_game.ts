// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.

import { OWGames, OWGamesEvents } from "@overwolf/overwolf-api-ts/dist";
import { AppWindow } from "../AppWindow";
import { kGamesFeatures, kWindowNames } from "../consts";


// Like the background window, it also implements the Singleton design pattern.
class InGame extends AppWindow{
  private static _instance: InGame;
  private gameEventsListener: OWGamesEvents

  private constructor() {
    super(kWindowNames.inGame)
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
          const parsedClockInfo = JSON.parse(event.data);
          console.log("Clock time", parsedClockInfo.clock_time)
          if (this.remindersConfig.stack.active) {
            this.checkForStack(parsedClockInfo.clock_time)
          }

          if (this.remindersConfig.midrunes.active) {
            this.checkForMidRunes(parsedClockInfo.clock_time)
          }

          if (this.remindersConfig.bountyrunes.active) {
            this.checkForBountyRunes(parsedClockInfo.clock_time)
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
    console.log("checkForStack called")
    const stackReminderTime = 15;
    const stackTime = 60

    if ((gameTime-stackReminderTime)%stackTime === 0) {
      console.log("Inside the if checkStack", { stackReminderTime, stackTime})
      const audio = new Audio("../sound/stack.mp3")
      audio.play();
    }
  } 

  private checkForMidRunes(gameTime: number): void {
    console.log("checkMidRunes called")
    const midRunesTime = 120;
    const midRunesAlertTime = this.remindersConfig['midrunes'].delay - midRunesTime 

    if ((gameTime-midRunesAlertTime)%midRunesTime === 0) {
      console.log("Inside the sound midrunes", {midRunesTime, midRunesAlertTime})
      const audio = new Audio("../sound/mid-rune.mp3")
      audio.play()
    }
  }

  private checkForBountyRunes(gameTime: number): void {
    console.log("checkBountyRunes called")
    const bountyRunesTime = 180;
    const bountyRunesAlertTime = this.remindersConfig['bountyrunes'].delay - bountyRunesTime 

    if ((gameTime-bountyRunesAlertTime)%bountyRunesTime === 0) {
      console.log("Inside the sound bounty runes", {bountyRunesTime, bountyRunesAlertTime})
      const audio = new Audio("../sound/bounty-runes.mp3")
      audio.play()
    }
  }

}

InGame.instace().run()
