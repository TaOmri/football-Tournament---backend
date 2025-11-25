"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMatchPoints = calculateMatchPoints;
function calculateMatchPoints(predictedHome, predictedAway, actualHome, actualAway) {
    if (actualHome === null || actualAway === null) {
        return 0;
    }
    if (predictedHome === actualHome && predictedAway === actualAway) {
        return 7;
    }
    const predictedDiff = Math.sign(predictedHome - predictedAway);
    const actualDiff = Math.sign(actualHome - actualAway);
    if (predictedDiff === actualDiff) {
        return 3;
    }
    return 0;
}
