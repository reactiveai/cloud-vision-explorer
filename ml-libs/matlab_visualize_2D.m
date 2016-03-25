load('vectors.mat');
scatter(vectors(:, 1), vectors(:,2));
labels = cellstr(labels);
text(vectors(:, 1), vectors(:,2), labels);