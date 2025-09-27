interface IAdvocate {
  id: number;
  firstName: string;
  lastName: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
  createdAt: string;
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
}
