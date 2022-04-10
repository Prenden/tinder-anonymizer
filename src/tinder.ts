import { P } from 'pino';
import puppeteer from 'puppeteer';

import { createLogger } from './core/logger';

const SELECTOR_TIMEOUT_MS = parseInt(process.env.SELECTOR_LOAD_TIMEOUT, 10);

export class Tinder {
  private logger: P.Logger;
  private page: puppeteer.Page;
  private browser: puppeteer.Browser;
  private chromeOptions: puppeteer.LaunchOptions &
    puppeteer.BrowserLaunchArgumentOptions &
    puppeteer.BrowserConnectOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: false,
    defaultViewport: null,
    timeout: 0,
  };

  constructor() {
    this.logger = createLogger('tinder-anonymizer:tinder');
  }

  public async init(): Promise<void> {
    const browserInit = await this.initPupeteer();

    if (!browserInit) {
      process.exit(1);
    }

    await this.page.waitForNetworkIdle({});

    const pages = await this.browser.pages();

    this.page = pages[0];

    const navigated = await this.navigateToSite('https://tinder.com');

    if (!navigated) {
      process.exit(1);
    }

    try {
        await this.addDefaultFunctions();
    } catch (e) {
        this.logger.error('Failed to add default functions.');
        this.logger.error(e);
    }
  }

  public async startIntervalTask(): Promise<void> {
    try {
      await this.changeBackgroundImages();
    } catch (e) {
      this.logger.error('Failed to execute interval task.');
      this.logger.error(e);
    }

    try {
        await this.changeMeta();
    } catch (e) {
        this.logger.error('Failed to change meta.');
        this.logger.error(e);
    }

    setTimeout(() => {
      this.startIntervalTask();
    }, 50);
  }

  public async kill(): Promise<void> {
    await this.page.close();

    return this.browser.close();
  }

  private async changeMeta(): Promise<void> {
      let changeMetaIfHas;
      await this.page.evaluate(() => {
        changeMetaIfHas();
      });
  }

  private async changeBackgroundImages(): Promise<void> {
    let recursivelySearchBackgroundImages;
    await this.page.evaluate(() => {
      recursivelySearchBackgroundImages(document.body);
    });
  }

  private async addDefaultFunctions(): Promise<void> {
    await this.page.addScriptTag({
      content: `
            const recursivelySearchBackgroundImages = (element) => {
                if (element && element.style && element.style.backgroundImage && element.style.backgroundImage.includes('url')) {
                    element.style.backgroundImage = "url('${process.env.NEW_IMAGE_URL}')";
                }
                
                const childElements = element.childNodes;
                for (let i = 0; i < childElements.length; ++i) {
                    recursivelySearchBackgroundImages(childElements[i]);
                }
            };
        `,
      type: 'application/javascript',
    });

    await this.page.addScriptTag({
        content: `
            const changeMetaIfHas = () => {
                const jobTitles = document.querySelectorAll('div[data-testid="info-job"]');
                if (jobTitles && jobTitles.length > 0) {
                    for (let i = 0; i < jobTitles.length; ++i) {
                        jobTitles[i].innerHTML = '${process.env.JOB_TITLE}';
                    }
                }
    
                const schools = document.querySelectorAll('div[data-testid="info-school"]');
                if (schools && schools.length > 0) {
                    for (let i = 0; i < schools.length; ++i) {
                        schools[i].innerHTML = '${process.env.SCHOOL}';
                    }
                }
    
                const cities = document.querySelectorAll('div[data-testid="info-city"]');
                if (cities && cities.length > 0) {
                    for (let i = 0; i < cities.length; ++i) {
                        cities[i].innerHTML = '${process.env.CITY}';
                    }
                }
    
                const distances = document.querySelectorAll('div[data-testid="info-distance"]');
                if (distances && distances.length > 0) {
                    for (let i = 0; i < distances.length; ++i) {
                        distances[i].innerHTML = '${process.env.DISTANCE}';
                    }
                }
    
                const bios = document.querySelectorAll('div[data-testid="info-bio"]');
                if (bios && bios.length > 0) {
                    for (let i = 0; i < bios.length; ++i) {
                        bios[i].innerHTML = '${process.env.BIO}';
                    }
                }

                const cardBios = document.querySelectorAll('div[data-testid="recCard_info"]');
                if (cardBios && cardBios.length > 0) {
                    for (let i = 0; i < cardBios.length; ++i) {
                        cardBios[i].innerHTML = '${process.env.CARD_BIO}';
                    }
                }
            };
        `,
        type: 'application/javascript',
    });

    this.page.on('load', this.addDefaultFunctions.bind(this));
    // await this.page.exposeFunction('recursivelySearchBackgroundImages', recursivelySearchBackgroundImages);
  }

  private async reload(page: puppeteer.Page = this.page) {
    try {
      await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });

      return true;
    } catch (e) {
      return false;
    }
  }

  private async click(
    selector: string,
    page: puppeteer.Page = this.page
  ): Promise<void> {
    return page.evaluate((selectorStr) => {
      (<any>document.querySelector(selectorStr)).click();
    }, selector);
  }

  private async navigateToSite(site: string): Promise<boolean> {
    try {
      await this.page.goto(site, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
      });

      this.logger.info(`Successfully navigated to site: ${site}`);

      return true;
    } catch (e) {
      this.logger.error('Failed to navigato to site: ', site);
      this.logger.error(e);
    }

    return false;
  }

  private async initPupeteer(): Promise<boolean> {
    try {
      // puppeteer.use(pluginStealth());
      this.browser = await puppeteer.launch(this.chromeOptions);
      this.page = (await this.browser.pages())[0];

      await this.page.setUserAgent(
        'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36'
      );

      this.logger.info('Browser successfully inited');

      return true;
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Failed to create browser and page instance...');
    }

    return false;
  }
}
