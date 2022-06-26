interface CurrentAchievementLevel {
    label: string;
    image: string;
}

const baseBadgesPath = '/img/badges';

export class Achievement {
    private readonly levels: AchievementLevel[];

    constructor(readonly name: string, levels: AchievementLevel[]) {
        this.levels = [...levels].sort((a, b) => b.unlockCriteria - a.unlockCriteria);
    }

    level(currentCount: number): CurrentAchievementLevel | null {
        const achievementLevel = this.levels.find((it) => currentCount >= it.unlockCriteria);
        if (!achievementLevel) {
            return null;
        }

        return {
            label: `${achievementLevel.prefix} ${this.name}`,
            image: achievementLevel.badgeURL,
        };
    }
}

class AchievementLevel {
    readonly badgeURL: string;

    constructor(readonly prefix: string, readonly unlockCriteria: number, badgeName: string) {
        this.badgeURL = `${baseBadgesPath}/${badgeName}.png`;
    }
}

export const auditorAchievement = new Achievement('Auditor', [
    new AchievementLevel('Rookie', 1, '0 Stars Auditor'),
    new AchievementLevel('Beginner', 10, '1 Star Auditor'),
    new AchievementLevel('Senior', 100, '2 Stars Auditor'),
    new AchievementLevel('Pro', 250, '3 Stars Auditor'),
    new AchievementLevel('Expert', 500, '4 Stars Auditor'),
    new AchievementLevel('Master', 1000, '5 Stars Auditor'),
]);
export const authorAchievement = new Achievement('Author', [
    new AchievementLevel('Rookie', 1, '0 Stars Author'),
    new AchievementLevel('Beginner', 10, '1 Star Author'),
    new AchievementLevel('Senior', 100, '2 Stars Author'),
    new AchievementLevel('Pro', 250, '3 Stars Author'),
    new AchievementLevel('Expert', 500, '4 Stars Author'),
    new AchievementLevel('Master', 1000, '5 Stars Author'),
]);
export const cleanerAchievement = new Achievement('Cleaner', [
    new AchievementLevel('Rookie', 1, '0 Stars Cleaner'),
    new AchievementLevel('Beginner', 10, '1 Star Cleaner'),
    new AchievementLevel('Senior', 100, '2 Stars Cleaner'),
    new AchievementLevel('Pro', 250, '3 Stars Cleaner'),
    new AchievementLevel('Expert', 500, '4 Stars Cleaner'),
    new AchievementLevel('Master', 1000, '5 Stars Cleaner'),
]);
export const completionistAchievement = new Achievement('Completionist', [
    new AchievementLevel('Rookie', 1, '0 Stars Completionist'),
    new AchievementLevel('Beginner', 10, '1 Star Completionist'),
    new AchievementLevel('Senior', 100, '2 Stars Completionist'),
    new AchievementLevel('Pro', 250, '3 Stars Completionist'),
    new AchievementLevel('Expert', 500, '4 Stars Completionist'),
    new AchievementLevel('Master', 1000, '5 Stars Completionist'),
]);
export const editorAchievement = new Achievement('Editor', [
    new AchievementLevel('Rookie', 1, '0 Stars Editor'),
    new AchievementLevel('Beginner', 10, '1 Star Editor'),
    new AchievementLevel('Senior', 100, '2 Stars Editor'),
    new AchievementLevel('Pro', 250, '3 Stars Editor'),
    new AchievementLevel('Expert', 500, '4 Stars Editor'),
    new AchievementLevel('Master', 1000, '5 Stars Editor'),
]);
