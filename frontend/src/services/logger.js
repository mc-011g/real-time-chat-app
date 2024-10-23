import log from 'loglevel';
const logger = log;

if (process.env.NODE_ENV === 'development') {
    logger.setLevel('debug');
} else {
    logger.setLevel('error');
}

export default logger;
