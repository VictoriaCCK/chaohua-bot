const {Builder, By, until } = require('selenium-webdriver');
const config = require('./config.json');

/**
 * Check in one chaohua
 * 
 * This should get executed before voting.
 * If check-in buttons with callback cannot be found,
 * check-in is regarded as complete.
 * 
 * @param driver WebDriver
 * @returns false if complete else true
 */
async function checkIn(driver) {
    await driver.get(config.urls['all-chaohua']);
    let checkInButton = await driver
                                 .wait(until.elementLocated(By.xpath(config.xpaths['check-in-buttons'])), config.timeouts.short)
                                 .catch(_ => { console.log('ALL CHECKED IN.'); });
    // let checkInNames = await driver.findElements(By.xpath(config.xpaths['check-in-names']));
    if (checkInButton) { // only the chaohuas that are not checked in
        console.log('CHECK IN.');
        // scroll down to element, not clickable if hidden
        await driver.executeScript("arguments[0].scrollIntoView(true);", checkInButton);
        await checkInButton.click().catch(err => console.log(err));
        return true;
    }
    return false;
}

/**
 * Entry point
 */
(async function launch() {
    let driver = await new Builder().forBrowser('chrome').build();

    // 1. Do everything after logging in
    await driver.get(config.urls['login']);
    let userField = await driver.wait(until.elementLocated(By.id(config['css-ids']['username'])), config.timeouts.short);
    let passwordField = await driver.wait(until.elementLocated(By.id(config['css-ids']['password'])), config.timeouts.short);
    let loginButton = await driver.wait(until.elementLocated(By.id(config['css-ids']['login-button'])), config.timeouts.short);
    setTimeout(() => { // TODO: avoid manual timeout
        userField.sendKeys(config.login.username).then(_ => {
            passwordField.sendKeys(config.login.password).then(_ => {
                loginButton.click();
            });
        });
    }, config.timeouts.short);
    await driver.wait(until.urlContains(config.urls['success-login']), config.timeouts.long);

    // 2. Check in all chaohuas
    // TODO: instead of interval, are there any softer ways?
    while (await checkIn(driver)) { await delay(config.timeouts.short); }

    // 3. Donate points
    await driver.get(config.urls['idol-chaohua']);
    let donateButton = await driver.wait(until.elementLocated(By.xpath(config.xpaths['donate-button'])), config.timeouts.short);
    donateButton.click();
})();