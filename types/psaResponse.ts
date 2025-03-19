export type PSAResponse = {
    PSACert: {
      Brand: string;
      CardGrade: string;
      CardNumber: string;
      Category: string;
      CertNumber: string;
      GradeDescription: string;
      IsDualCert: boolean;
      IsPSADNA: boolean;
      LabelType: string;
      PopulationHigher: number;
      ReverseBarCode: boolean;
      SpecID: number;
      SpecNumber: string;
      Subject: string;
      TotalPopulation: number;
      TotalPopulationWithQualifier: number;
      Variety: string;
      Year: string;
      Cost?: number; 
      Value?: number;
    };
  };
  