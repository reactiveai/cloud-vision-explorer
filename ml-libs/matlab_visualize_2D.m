load('vectors.mat');
assignments = assignments';

radius_threshold = 0.1;
x_p = java.util.ArrayList;
y_p = java.util.ArrayList;

scatter(vectors(:, 1), vectors(:,2), [], assignments, 'filled', 'pentagram');
colormap(jet);
labels = cellstr(labels);
t = text(vectors(:, 1), vectors(:,2), labels);
title('2D projection of the most dominant label for each image.');
xlabel('X');
ylabel('Y');

for i = 1:length(t)
    if rem(i, 100) == 0
        disp(i);
    end
    t(i).FontSize = 10;
    cur_x = t(i).Position(1);
    cur_y = t(i).Position(2);
    
    if i == 1
        x_p.add(cur_x);
        y_p.add(cur_y);
    end
    
    add = 1;
    for j = 0:x_p.size()-1
        r = sqrt((x_p.get(j) - t(i).Position(1))^2 + (y_p.get(j) - t(i).Position(2))^2);
        if(r < radius_threshold)
           %do no insert insert. too close 
           t(i).String = '';
           add = 0;
           break
        end
    end
    
    if add
        x_p.add(cur_x);
        y_p.add(cur_y);
    end
end

hold off;