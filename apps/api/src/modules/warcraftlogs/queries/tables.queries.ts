export const FIGHT_DAMAGE_TABLE_QUERY = `
  query FightDamageTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
    reportData {
      report(code: $code) {
        table(dataType: DamageDone, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
      }
    }
  }
`;

export const FIGHT_DEATHS_TABLE_QUERY = `
  query FightDeathsTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
    reportData {
      report(code: $code) {
        table(dataType: Deaths, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
      }
    }
  }
`;

export const FIGHT_INTERRUPTS_TABLE_QUERY = `
  query FightInterruptsTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
    reportData {
      report(code: $code) {
        table(dataType: Interrupts, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
      }
    }
  }
`;

export const FIGHT_CASTS_TABLE_QUERY = `
  query FightCastsTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
    reportData {
      report(code: $code) {
        table(dataType: Casts, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
      }
    }
  }
`;

export const FIGHT_EVENTS_QUERY = `
  query FightEvents($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int], $filterExpression: String) {
    reportData {
      report(code: $code) {
        events(startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs, filterExpression: $filterExpression) {
          data
          nextPageTimestamp
        }
      }
    }
  }
`;
