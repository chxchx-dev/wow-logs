export const REPORT_METADATA_QUERY = `
  query ReportMetadata($code: String!) {
    reportData {
      report(code: $code) {
        code
        title
        startTime
        endTime
        owner { name }
        zone { name }
      }
    }
  }
`;

export const REPORT_FIGHTS_QUERY = `
  query ReportFights($code: String!) {
    reportData {
      report(code: $code) {
        fights {
          id
          name
          startTime
          endTime
          kill
          difficulty
          encounterID
        }
      }
    }
  }
`;

export const REPORT_MASTER_DATA_QUERY = `
  query ReportMasterData($code: String!) {
    reportData {
      report(code: $code) {
        masterData {
          actors {
            id
            name
            type
            subType
            server
          }
        }
      }
    }
  }
`;
