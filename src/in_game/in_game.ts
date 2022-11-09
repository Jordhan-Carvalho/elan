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
  private lastWardCall = 0

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
  }

  private onNewEvents(e) {
    e.events.map(event => {
      switch (event.name) {
        case 'clock_time_changed':
          const parsedClockInfo = JSON.parse(event.data);
          if (parsedClockInfo.clock_time > 0) {

            if (this.remindersConfig.stack.active) {
              this.checkForStack(parsedClockInfo.clock_time)
            }

            if (this.remindersConfig.midrunes.active) {
              this.checkForMidRunes(parsedClockInfo.clock_time)
            }

            if (this.remindersConfig.bountyrunes.active) {
              this.checkForBountyRunes(parsedClockInfo.clock_time)
            }

            if (this.remindersConfig.neutral.active) {
              this.checkNeutralItems(parsedClockInfo.clock_time)
            }

            if (this.remindersConfig.smoke.active) {
              this.checkForSmoke(parsedClockInfo.clock_time)
            }
          }
          break;
        case 'ward_purchase_cooldown_changed':
          const parsedWardData = JSON.parse(event.data)
          if (this.remindersConfig.ward.active) {
            this.checkForWard(parsedWardData.ward_purchase_cooldown)
          }
          break;
        case 'match_ended':
          this.lastWardCall = 0
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
    const stackTime = 60
    const stackAlertTime = stackTime - this.remindersConfig['stack'].delay

    if ((gameTime-stackAlertTime)%stackTime === 0) {
      const audio = new Audio("../sound/stack.mp3")
      audio.play();
    }
  } 

  private checkForMidRunes(gameTime: number): void {
    const midRunesTime = 120;
    const midRunesAlertTime = midRunesTime - this.remindersConfig['midrunes'].delay

    if ((gameTime-midRunesAlertTime)%midRunesTime === 0) {
      const audio = new Audio("../sound/mid-rune.mp3")
      audio.play()
    }
  }

  private checkForBountyRunes(gameTime: number): void {
    const bountyRunesTime = 180;
    const bountyRunesAlertTime = bountyRunesTime - this.remindersConfig['bountyrunes'].delay

    if ((gameTime-bountyRunesAlertTime)%bountyRunesTime === 0) {
      const audio = new Audio("../sound/bounty-runes.mp3")
      audio.play()
    }
  }

  private checkNeutralItems(gameTime: number) {
    const neutralItemsTime = [420, 1020, 1620, 2200, 3600]

    for (let i = 0; i < neutralItemsTime.length; i++) {
      if (gameTime === neutralItemsTime[i]) {
        const audio = new Audio(`../sound/neutralTier${i+1}.mp3`)
        audio.play()
      }
    }
  }

  private checkForSmoke(gameTime: number) {
    const smokeTime = 420
    const smokeAlertTime = smokeTime - this.remindersConfig['smoke'].delay

    if((gameTime-smokeAlertTime)%smokeTime === 0) {
      const audio = new Audio("../sound/smoke.mp3")
      audio.play();
    }

  }

  private checkForWard(wardCd: number) {
    const timeBetweenCalls = 30

    const now = Math.round(new Date().getTime() / 1000)
    if (wardCd === 0 && this.lastWardCall+timeBetweenCalls <= now) {
      const audio = new Audio("../sound/wards.mp3")
      audio.play();
      this.lastWardCall = now;
    }
  }

}

InGame.instace().run()
