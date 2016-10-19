
setwd("~/Documents/nd/P6-d3/P6-Make-Effective-Data-Visualization/data")

pf <- read.csv('prosperLoanData.csv')
names(pf)

head(pf)

LoanData <- pf[, c(9, 48, 50, 64, 65, 68, 69, 71)]

names(LoanData)

library(dplyr)

anual_LoanData <- LoanData %>% 
  group_by(LoanOriginationDate) %>% 
  summarise(BorrowerRate = mean(BorrowerRate),
            StatedMonthlyIncome = mean(StatedMonthlyIncome),
            LoanOriginalAmount = mean(LoanOriginalAmount),
            MonthlyLoanPayment = mean(MonthlyLoanPayment),
            LP_CustomerPayments = mean(LP_CustomerPayments),
            LP_InterestandFees = mean(LP_InterestandFees)) %>%
  arrange(LoanOriginationDate)
            
write.csv(anual_LoanData, "anual_ProsperLoanData.csv", row.names=FALSE)

