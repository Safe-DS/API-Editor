const baseBadgesPath = '/img/badges';

interface CurrentAchievementLevel {
    label: string;
    image: string;
}

class Achievement {
    private readonly levels: AchievementLevel[];

    constructor(readonly name: string, levels: AchievementLevel[]) {
        this.levels = [...levels].sort((a, b) => b.unlockCriteria - a.unlockCriteria);
    }

    level(currentCount: number): CurrentAchievementLevel | null {
        const achievementLevel = this.levels.find(it => it.unlockCriteria >= currentCount)
        if (!achievementLevel) {
            return null;
        }

        return {
            label: `${achievementLevel.prefix} ${this.name}`,
            image: achievementLevel.badgeURL,
        }
    }
}

class AchievementLevel {
    readonly badgeURL: string;

    constructor(readonly prefix: string, readonly unlockCriteria: number, badgeName: string) {
        this.badgeURL = `${baseBadgesPath}/${badgeName}.png`;
    }
}

export const auditorAchievement = new Achievement('Auditor', [
    new AchievementLevel('Rookie', 1, 'O Star Auditor'),
    new AchievementLevel('Beginner', 10, '1 Star Auditor'),
    new AchievementLevel('Senior', 100, '2 Star Auditor'),
    new AchievementLevel('Pro', 250, '3 Star Auditor'),
    new AchievementLevel('Expert', 500, '4 Star Auditor'),
    new AchievementLevel('Master', 1000, '5 Star Auditor'),
]);
export const authorAchievement = new Achievement('Author', [
    new AchievementLevel('Rookie', 1, 'O Star Author'),
    new AchievementLevel('Beginner', 10, '1 Star Author'),
    new AchievementLevel('Senior', 100, '2 Star Author'),
    new AchievementLevel('Pro', 250, '3 Star Author'),
    new AchievementLevel('Expert', 500, '4 Star Author'),
    new AchievementLevel('Master', 1000, '5 Star Author'),
]);
export const cleanerAchievement = new Achievement('Cleaner', [
    new AchievementLevel('Rookie', 1, 'O Star Cleaner'),
    new AchievementLevel('Beginner', 10, '1 Star Cleaner'),
    new AchievementLevel('Senior', 100, '2 Star Cleaner'),
    new AchievementLevel('Pro', 250, '3 Star Cleaner'),
    new AchievementLevel('Expert', 500, '4 Star Cleaner'),
    new AchievementLevel('Master', 1000, '5 Star Cleaner'),
]);
export const completionistAchievement = new Achievement('Completionist', [
    new AchievementLevel('Rookie', 1, 'O Star Completionist'),
    new AchievementLevel('Beginner', 10, '1 Star Completionist'),
    new AchievementLevel('Senior', 100, '2 Star Completionist'),
    new AchievementLevel('Pro', 250, '3 Star Completionist'),
    new AchievementLevel('Expert', 500, '4 Star Completionist'),
    new AchievementLevel('Master', 1000, '5 Star Completionist'),
]);
export const editorAchievement = new Achievement('Editor', [
    new AchievementLevel('Rookie', 1, 'O Star Editor'),
    new AchievementLevel('Beginner', 10, '1 Star Editor'),
    new AchievementLevel('Senior', 100, '2 Star Editor'),
    new AchievementLevel('Pro', 250, '3 Star Editor'),
    new AchievementLevel('Expert', 500, '4 Star Editor'),
    new AchievementLevel('Master', 1000, '5 Star Editor'),
]);
