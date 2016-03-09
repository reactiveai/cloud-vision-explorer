load('mnist_test.mat');
load('mnist_train.mat');

% data = vertcat(train_X, test_X);
% labels = vertcat(train_labels, test_labels);

numDims = 2; pcaDims = 50; perplexity = 50; theta = .5;
map = fast_tsne(data, numDims, pcaDims, perplexity, theta);
% gscatter(map(:,1), map(:,2), labels);

gscatter(map(:,1), map(:,2));
label = cellstr(label);
text(map(:,1), map(:,2), label, 'horizontal','left', 'vertical','bottom')

