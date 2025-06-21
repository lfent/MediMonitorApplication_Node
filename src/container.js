const { createContainer, asClass, asValue } = require('awilix');

const config = require('./infra/config/config');
const LogService = require('./infra/logService');
const db = require('./repositories/database');
const GlobalProvider = require('./infra/globalProvider');

// Business
const NetrisBusiness = require('./business/netrisBusiness');
const GoogleBusiness = require('./business/googleBusiness');
const CoreBusiness = require('./business/coreBusiness');

// Repository
const NetrisRepository = require('./repositories/netrisRepository');

const args = process.argv.slice(2);

const container = createContainer();

container.register({
    config: asValue(config),
    log: asClass(LogService).singleton(),
    db: asValue(db),
    globalProvider: asClass(GlobalProvider).singleton(),

    // Repositories
    netrisRepository: asClass(NetrisRepository).singleton(),

    // Business
    netrisBusiness: asClass(NetrisBusiness).singleton(),
    googleBusiness: asClass(GoogleBusiness).singleton(),
    coreBusiness: asClass(CoreBusiness).singleton(),

    args: asValue(args)
});

module.exports = container;
