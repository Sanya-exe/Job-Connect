import Job from "../models/job.js";

const searchByFields = (query, queryString) => {
  if (queryString.title) {
    query = query.find({
      title: { $regex: queryString.title, $options: "i" },
    });
  }

  if (queryString.company) {
    query = query.find({
      company: { $regex: queryString.company, $options: "i" },
    });
  }

  return query;
};

const filterByLocation = (query, queryString) => {
  const filters = {};

  if (queryString.city) {
    filters.city = { $regex: queryString.city, $options: "i" };
  }

  if (queryString.country) {
    filters.country = { $regex: queryString.country, $options: "i" };
  }

  if (queryString.location) {
    filters.location = { $regex: queryString.location, $options: "i" };
  }

  if (Object.keys(filters).length > 0) {
    query = query.find(filters);
  }

  return query;
};

const filterByDatePosted = (query, queryString) => {
  if (queryString.datePosted) {
    const daysAgo = parseInt(queryString.datePosted);

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    query = query.find({
      jobPostedOn: { $gte: date },
    });
  }

  return query;
};

const filterByPay = (query, queryString) => {
  if (queryString.pay) {
    const minPay = parseInt(queryString.pay);

    query = query.find({
      $or: [
        { fixedSalary: { $gte: minPay } },
        {
          salaryFrom: { $lte: minPay },
          salaryTo: { $gte: minPay },
        },
      ],
    });
  }

  return query;
};

const filterByExperienceLevel = (query, queryString) => {
  if (queryString.experienceLevel) {
    query = query.find({
      experienceLevel: queryString.experienceLevel,
    });
  }

  return query;
};

const filterBySkills = (query, queryString) => {
  if (queryString.skills) {
    const skills = queryString.skills
      .split(",")
      .map((skill) => skill.trim());

    query = query.find({
      skillsRequired: { $in: skills },
    });
  }

  return query;
};

const excludeExpired = (query) => {
  return query.find({ expired: false });
};

export const applyFilters = async (query, queryString) => {
  query = searchByFields(query, queryString);
  query = filterByLocation(query, queryString);
  query = filterByDatePosted(query, queryString);
  query = filterByPay(query, queryString);
  query = filterByExperienceLevel(query, queryString);
  query = filterBySkills(query, queryString);
  query = excludeExpired(query);

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  return query;
};