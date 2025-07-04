export const onlyBluefly = (req, res, next) => {
  req.blueflyFilter = { account_type: 'BLUEFLY' };
  next();
};

export const personalCompanyOnly = (req, res, next) => {
  req.accountTypeFilter = { account_type: { $in: ['PERSONAL', 'COMPANY'] } };
  next();
};
