import { config } from 'dotenv-safe';

import { createLogger } from './core/logger';
import { Tinder } from './tinder';

config();

const logger = createLogger('main');

const tinder = new Tinder();

const bootstrap = async () => {
    logger.info(`Starting Tinder anonymizer.`);

    try {
        await tinder.init();

        logger.info(`Successfully init Tinder.`);
    } catch (e) {
        logger.error('Failed to init Tinder.');
        logger.error(e);
    }

    try {
        await tinder.startIntervalTask();
    } catch (e) {
        logger.error('Failed to start interval task.');
        logger.error(e);
    }
};

// async function exitHandler(options) {
//     logger.info({ options });
//     if (options.cleanup) {
//         logger.info('Clean up started...');
//         await tinder.kill();
//     }

//     process.exit(0);
// }

// process.stdin.resume();
// process.on('exit', exitHandler.bind({ cleanup: true }));

// process.on('SIGINT', exitHandler.bind({ cleanup: true }));

// process.on('SIGUSR1', exitHandler.bind({ cleanup: true }));
// process.on('SIGUSR2', exitHandler.bind({ cleanup: true }));

// process.on('uncaughtException', exitHandler.bind({ cleanup: true }));
// process.on('unhandledRejection', exitHandler.bind({ cleanup: true }));

bootstrap();