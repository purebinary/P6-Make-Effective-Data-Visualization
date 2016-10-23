
setwd("~/Documents/nd/P6-d3/P6-Make-Effective-Data-Visualization/data")

pf <- read.csv('prosperLoanData.csv')
names(pf)

head(pf)

LoanData <- pf[, c(9, 35, 37, 48, 50, 64, 65, 68, 69, 71)]

names(LoanData)

library(dplyr)

quarter_LoanData <- pf %>% 
  group_by(LoanOriginationQuarter, IncomeRange) %>% 
  summarise(BorrowerRate = mean(BorrowerRate)) %>%
  ungroup() %>% 
  arrange(LoanOriginationQuarter)

quarter_LoanData <- subset(quarter_LoanData, IncomeRange!="Not displayed")

quarter_LoanData <- subset(quarter_LoanData, IncomeRange!="$0")

library(ggplot2)

ggplot(aes(x= IncomeRange, y = BorrowerRate), data = quarter_LoanData) +
  geom_boxplot()


ggplot(aes(x= LoanOriginationQuarter, y = BorrowerRate), data = quarter_LoanData) +
  geom_point() +
  facet_wrap(~IncomeRange)


str(quarter_LoanData)

levels(quarter_LoanData$IncomeRange)
write.csv(quarter_LoanData, "quarter_ProsperLoanData.csv", row.names=FALSE)

