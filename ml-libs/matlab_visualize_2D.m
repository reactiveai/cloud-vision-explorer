load('vectors.mat');
assignments = assignments';
scatter(vectors(:, 1), vectors(:,2), [], assignments, 'filled', 'pentagram');
colormap(jet);
labels = cellstr(labels);
t = text(vectors(:, 1), vectors(:,2), labels);
for i = 1:length(t)
    t(i).FontSize = 7;
end